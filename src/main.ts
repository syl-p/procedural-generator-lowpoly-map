import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { CylinderGeometry, MeshStandardMaterial } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('#app canvas')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#ffeecc')

/**
 * Sizes
 */
 const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

if (canvas) {
  /**
   * Camera
   */

  // Base camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.z = 50
  scene.add(camera)

  // EnvMap
  var loader = new THREE.CubeTextureLoader();
  loader.setPath( 'textures/cube/0/' );
  var textureCube = loader.load( [
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
  ] );

  // Controls
  const controls = new OrbitControls(camera, canvas as HTMLElement)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  // Prepare var and funct
  const hexaMat = new MeshStandardMaterial({
    envMap: textureCube,
    flatShading: true
  })

  const hexagon = (height: number, position: THREE.Vector2) => {
    let geo = new CylinderGeometry(1, 1, height, 6, 1, false)
    const hex = new THREE.Mesh(geo, hexaMat)
    hex.position.set((position.x + (position.y % 2) / 2 ) * 1.77, 0, position.y * 1.535)
    return hex
  }

  // SHOW TIME
  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      scene.add(hexagon(3, new THREE.Vector2(i, j)))
    }
  }


  // RENDER AND ANIMATION

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
      alpha: true
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.physicallyCorrectLights = true

  window.addEventListener('resize', () =>
  {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })


  /**
   * Animate
   */
  const clock = new THREE.Clock()
  const tick = () =>
  {

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()
}


