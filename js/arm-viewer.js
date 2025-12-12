// arm-viewer.js – non-module version for file:// usage

(function () {
  if (!window.THREE) {
    console.warn('THREE not found; check script includes.');
    return;
  }

  const container = document.getElementById('arm-viewer');
  if (!container) {
    console.warn('arm-viewer container not found.');
    return;
  }

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(3.6, 2.7, 5.2);
  camera.lookAt(0, 1.3, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(4, 5.5, 3.2);
  keyLight.castShadow = false;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x99aaff, 0.42);
  fillLight.position.set(-3.5, 3.0, -4.0);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff9977, 0.28);
  rimLight.position.set(-2.5, 3.8, 5.5);
  scene.add(rimLight);

  // Pivot hierarchy
  const armBasePivot = new THREE.Object3D();
  const armYawPivot = new THREE.Object3D();
  const armPitchPivot = new THREE.Object3D();

  armBasePivot.position.set(0, 0, 0);
  armBasePivot.add(armYawPivot);
  armYawPivot.add(armPitchPivot);
  scene.add(armBasePivot);

  let armModel = null;
  const loader = new THREE.OBJLoader();

  loader.load(
    'assets/Rmk3.obj',
    function (obj) {
      armModel = obj;

      const box = new THREE.Box3().setFromObject(armModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
      const desiredHeight = 2.6;
      const scale = desiredHeight / maxDim;
      armModel.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(armModel);
      const center = new THREE.Vector3();
      scaledBox.getCenter(center);
      const minY = scaledBox.min.y;

      armModel.position.set(-center.x, -minY, -center.z);

      armModel.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material && !Array.isArray(child.material)) {
            child.material.metalness = 0.28;
            child.material.roughness = 0.42;
          }
        }
      });

      armPitchPivot.add(armModel);
    },
    undefined,
    function (err) {
      console.error('Error loading robotic arm OBJ', err);
    }
  );

  // Pointer → world logic
  const pointerNDC = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const targetWorld = new THREE.Vector3();
  const planeNormal = new THREE.Vector3();
  const plane = new THREE.Plane();
  const baseWorld = new THREE.Vector3();
  const dirToTarget = new THREE.Vector3();

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pointerNDC.x = x * 2 - 1;
    pointerNDC.y = -(y * 2 - 1);
  }

  window.addEventListener('pointermove', onPointerMove);

  // Rotation state and constraints
  let currentYaw = 0;

  const basePitch = THREE.MathUtils.degToRad(0); // fixed tilt
  armPitchPivot.rotation.x = basePitch;

  const yawMin = THREE.MathUtils.degToRad(-90);
  const yawMax = THREE.MathUtils.degToRad(90);

  const smoothing = 0.14;

  function updateArmAim() {
    if (!armModel) return;

    armBasePivot.getWorldPosition(baseWorld);
    camera.getWorldDirection(planeNormal).normalize();

    const planePoint = baseWorld.clone().add(
      planeNormal.clone().multiplyScalar(2.5)
    );
    plane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

    raycaster.setFromCamera(pointerNDC, camera);
    const hit = raycaster.ray.intersectPlane(plane, targetWorld);
    if (!hit) return;

    dirToTarget.copy(targetWorld).sub(baseWorld).normalize();

    // Yaw only (side to side)
    const targetYaw = Math.atan2(dirToTarget.x, dirToTarget.z);
    const clampedYaw = THREE.MathUtils.clamp(targetYaw, yawMin, yawMax);

    currentYaw += (clampedYaw - currentYaw) * smoothing;

    armYawPivot.rotation.y = currentYaw;
    // Pitch stays fixed at basePitch
    armPitchPivot.rotation.x = basePitch;
  }

  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    updateArmAim();
    renderer.render(scene, camera);
  }
  animate(performance.now());

  function onResize() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);
})();
