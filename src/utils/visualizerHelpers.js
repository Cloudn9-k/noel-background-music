// src/utils/visualizerHelpers.js
import * as THREE from 'three';

// --- CÁC HÀM TOÁN HỌC BỔ TRỢ ---
const { PI, sin, cos } = Math;
const TAU = 2 * PI;

const map = (value, sMin, sMax, dMin, dMax) => dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
const rand = (max, min = 0) => min + Math.random() * (max - min);
const randInt = (max, min = 0) => Math.floor(min + Math.random() * (max - min));
const randChoise = (arr) => arr[randInt(arr.length)];
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)];

// --- LOGIC MOBILE FRIENDLY ---
// Kiểm tra xem màn hình có nhỏ hơn 768px (iPad/Điện thoại) không
const isMobile = window.innerWidth < 768;

// Hàm tính toán số lượng hạt dựa trên thiết bị
// Nếu là Mobile: Giảm số hạt xuống còn 1/3
// Nếu là PC: Giữ nguyên
const getPointCount = (totalPoints) => {
    return isMobile ? Math.floor(totalPoints / 3) : totalPoints;
};

// --- 1. HÀM TẠO CÂY THÔNG (Visualizer) ---
export const addTree = (scene, uniforms, totalPoints, treePosition) => {
    // Tự động giảm số hạt nếu là mobile để mượt hơn
    const actualPoints = getPointCount(totalPoints);

    const vertexShader = `
      attribute float mIndex;
      varying vec3 vColor;
      varying float opacity;
      uniform sampler2D tAudioData;

      float norm(float value, float min, float max ){
          return (value - min) / (max - min);
      }
      float lerp(float norm, float min, float max){
          return (max - min) * norm + min;
      }
      float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
          return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
      }

      void main() {
          vColor = color;
          vec3 p = position;
          vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );

          // Lấy dữ liệu âm thanh để làm hiệu ứng rung
          float amplitude = texture2D( tAudioData, vec2( mIndex, 0.1 ) ).r;
          float amplitudeClamped = clamp(amplitude-0.4, 0.0, 0.6 );
          float sizeMapped = map(amplitudeClamped, 0.0, 0.6, 1.0, 20.0);

          opacity = map(mvPosition.z , -200.0, 15.0, 0.0, 1.0);
          gl_PointSize = sizeMapped * ( 100.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float opacity;
      uniform sampler2D pointTexture;
      void main() {
          gl_FragColor = vec4( vColor, opacity );
          gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...uniforms,
            pointTexture: { value: new THREE.TextureLoader().load(`https://assets.codepen.io/3685267/spark1.png`) },
        },
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const mIndexs = [];
    const color = new THREE.Color();

    for (let i = 0; i < actualPoints; i++) {
        const t = Math.random();
        const y = map(t, 0, 1, -8, 10);
        const ang = map(t, 0, 1, 0, 6 * TAU) + (TAU / 2) * (i % 2);
        const [z, x] = polar(ang, map(t, 0, 1, 5, 0));
        const modifier = map(t, 0, 1, 1, 0);

        positions.push(x + rand(-0.3 * modifier, 0.3 * modifier));
        positions.push(y + rand(-0.3 * modifier, 0.3 * modifier));
        positions.push(z + rand(-0.3 * modifier, 0.3 * modifier));

        // Lưu ý: map theo actualPoints để dải màu vẫn đẹp dù ít hạt hơn
        color.setHSL(map(i, 0, actualPoints, 1.0, 0.0), 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
        
        mIndexs.push(map(i, 0, actualPoints, 1.0, 0.0));
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("mIndex", new THREE.Float32BufferAttribute(mIndexs, 1));

    const tree = new THREE.Points(geometry, shaderMaterial);
    tree.position.set(...treePosition);
    scene.add(tree);
};

// --- 2. HÀM TẠO TUYẾT RƠI ---
export const addSnow = (scene, uniforms) => {
    const vertexShader = `
      attribute float size;
      attribute float phase;
      attribute float phaseSecondary;
      varying vec3 vColor;
      varying float opacity;
      uniform float time;
      uniform float step;

      float norm(float value, float min, float max ){ return (value - min) / (max - min); }
      float lerp(float norm, float min, float max){ return (max - min) * norm + min; }
      float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){ return lerp(norm(value, sourceMin, sourceMax), destMin, destMax); }

      void main() {
          float t = time * 0.0006;
          vColor = color;
          vec3 p = position;
          p.y = map(mod(phase+step, 1000.0), 0.0, 1000.0, 25.0, -8.0);
          p.x += sin(t+phase);
          p.z += sin(t+phaseSecondary);
          opacity = map(p.z, -150.0, 15.0, 0.0, 1.0);

          vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
          gl_PointSize = size * ( 100.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      varying float opacity;
      void main() {
          gl_FragColor = vec4( vColor, opacity );
          gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
      }
    `;

    const sprites = [
        "https://assets.codepen.io/3685267/snowflake1.png",
        "https://assets.codepen.io/3685267/snowflake2.png",
        "https://assets.codepen.io/3685267/snowflake3.png",
        "https://assets.codepen.io/3685267/snowflake4.png",
        "https://assets.codepen.io/3685267/snowflake5.png",
    ];

    sprites.forEach(sprite => {
        // Mobile chỉ cần 100 bông mỗi loại (PC là 300)
        const totalPoints = isMobile ? 100 : 300;

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                ...uniforms,
                pointTexture: { value: new THREE.TextureLoader().load(sprite) }
            },
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true,
        });

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];
        const phases = [];
        const phaseSecondaries = [];
        const color = new THREE.Color();

        for (let i = 0; i < totalPoints; i++) {
            positions.push(rand(25, -25), 0, rand(15, -150));
            
            color.set(randChoise(["#f1d4d4", "#f1f6f9", "#eeeeee", "#f1f1e8"]));
            colors.push(color.r, color.g, color.b);
            
            phases.push(rand(1000));
            phaseSecondaries.push(rand(1000));
            sizes.push(rand(4, 2));
        }

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
        geometry.setAttribute("phaseSecondary", new THREE.Float32BufferAttribute(phaseSecondaries, 1));

        scene.add(new THREE.Points(geometry, shaderMaterial));
    });
};

// --- 3. HÀM TẠO NỀN ĐẤT (CÁC ĐỐM SÁNG DƯỚI ĐẤT) ---
export const addPlane = (scene, uniforms, totalPoints) => {
    // Giảm số hạt nền cho mobile
    const actualPoints = getPointCount(totalPoints);

    const vertexShader = `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          gl_PointSize = size * ( 300.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
          gl_FragColor = vec4( vColor, 1.0 );
          gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...uniforms,
            pointTexture: { value: new THREE.TextureLoader().load(`https://assets.codepen.io/3685267/spark1.png`) }
        },
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const color = new THREE.Color();

    for (let i = 0; i < actualPoints; i++) {
        const [x, y, z] = [rand(-25, 25), 0, rand(-150, 15)];
        positions.push(x);
        positions.push(y);
        positions.push(z);

        color.set(randChoise(["#93abd3", "#f2f4c0", "#9ddfd3"]));
        colors.push(color.r, color.g, color.b);
        sizes.push(1);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("customColor", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const plane = new THREE.Points(geometry, shaderMaterial);
    plane.position.y = -8;
    scene.add(plane);
};