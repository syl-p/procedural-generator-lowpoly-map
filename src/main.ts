import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { CylinderGeometry, MeshPhysicalMaterial, MeshStandardMaterial, SphereGeometry } from 'three'
import {createNoise2D} from 'simplex-noise';

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

const MAX_HEIGHT = 10
const STONE_HEIGHT = MAX_HEIGHT * 0.8
const DIRT_HEIGHT = MAX_HEIGHT * 0.7
const GRASS_HEIGHT = MAX_HEIGHT * 0.5
const SAND_HEIGHT = MAX_HEIGHT * 0.3
const DIRT2_HEIGHT = MAX_HEIGHT * 0


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


  var textureLoader = new THREE.TextureLoader()
  
  const textures: any = {
    stone: await textureLoader.loadAsync('textures/stone.png'),
    grass: await textureLoader.loadAsync('textures/grass.jpg'),
    dirt: await textureLoader.loadAsync('textures/dirt.png'),
    dirt2: await textureLoader.loadAsync('textures/dirt2.jpg'),
    sand: await textureLoader.loadAsync('textures/sand.jpg'),
    water: await textureLoader.loadAsync('textures/water.jpg')
  }

  // Controls
  const controls = new OrbitControls(camera, canvas as HTMLElement)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const adjustPositionWithModulo = (position: THREE.Vector2) => {
    return new THREE.Vector2((position.x + (position.y % 2) / 2 ) * 1.77, position.y * 1.535)
  }

  const hexagon = (height: number, position: THREE.Vector2, texture: THREE.Texture) => {
    console.log(texture)

    // Prepare var and funct
    const hexaMat = new MeshStandardMaterial({
      envMap: textureCube,
      envMapIntensity: 0.13,
      flatShading: true,
      map: texture
    })

    let geo = new CylinderGeometry(1, 1, height, 6, 1, false)
    const hex = new THREE.Mesh(geo, hexaMat)
    hex.position.set(position.x, 0, position.y)
    hex.position.y += height / 2

    hex.castShadow = true
    hex.receiveShadow = true

    return hex
  }

  const rock = (height: number, position: THREE.Vector2) => {
    const rPx = Math.random() * 0.4
    const rPy = Math.random() * 0.4

    const geo = new THREE.SphereGeometry(Math.random() * 0.3, 7, 7)
    geo.translate(position.x + rPx, height, position.y + rPy)
    const rock = new THREE.Mesh(geo, new MeshStandardMaterial({
      map: textures.stone
    }))

    rock.receiveShadow = true
    return rock
  }

  const three = (height: number, position: THREE.Vector2) => {
    const threeHeight = Math.random() * 1 + 1.25
    const threeMat =  new MeshStandardMaterial({
      map: textures.grass
    })

    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.5, threeHeight, 3), threeMat)
    p1.geometry.translate(position.x, height + threeHeight * 0 + 1, position.y)
    p1.castShadow = true
    p1.receiveShadow = true

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.15, threeHeight, 3), threeMat)
    p2.geometry.translate(position.x, height + threeHeight * 0.6 + 1, position.y)
    p2.castShadow = true
    p2.receiveShadow = true

    const p3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.8, threeHeight, 3), threeMat)
    p3.geometry.translate(position.x, height + threeHeight * 1.25 + 1, position.y)
    p3.castShadow = true
    p3.receiveShadow = true

    
    return [p1, p2, p3]
  }

  scene.add(new THREE.AxesHelper(5))

  // SHOW TIME
  //@ts-ignore
  const noise2D = createNoise2D()
  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      let position = adjustPositionWithModulo(new THREE.Vector2(i, j))

      if (position.length() < 16) {
        console.log('-----')

        let noise = (noise2D(i * 0.08, j * 0.08) + 1) * 0.5

        console.log(noise + 1, Math.pow(noise, 1.5))
        
        const noiseUp = Math.pow(noise <= 0 ? noise * -1 :  noise, 1.5) * MAX_HEIGHT
        
        let textureToApply = null
        if(noiseUp > STONE_HEIGHT) {
          textureToApply = textures.stone
          if (Math.random() > 0.8)
          scene.add(rock(noiseUp, position))

        } else if (noiseUp > DIRT_HEIGHT) {
          textureToApply = textures.dirt

          if (Math.random() > 0.8)
          scene.add(three(noiseUp, position)[0], three(noiseUp, position)[1], three(noiseUp, position)[2])
          
        } else if (noiseUp > GRASS_HEIGHT) {
          textureToApply = textures.grass
        } else if (noiseUp > SAND_HEIGHT) {
          textureToApply = textures.sand

          if (Math.random() > 0.8)
          scene.add(rock(noiseUp, position))
        } else if (noiseUp > DIRT2_HEIGHT) {
          textureToApply = textures.dirt2
        }
        
        scene.add(hexagon(noiseUp , position, textureToApply))
      }
    }
  }

  // SEA
  let seaMesh = new THREE.Mesh(new CylinderGeometry(17, 17, MAX_HEIGHT * 0.2, 50), 
    new MeshPhysicalMaterial({
      envMap: textureCube,
      color: new THREE.Color('#55aaff').convertSRGBToLinear().multiplyScalar(3),
      ior: 1.4,
      transmission: 1,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 0.2, 
      roughness: 1,
      metalness: 0.025,
      roughnessMap: textures.water,
      metalnessMap: textures.water,
    })
  )
  seaMesh.receiveShadow = true
  seaMesh.position.set(0, 0, 0)
  scene.add(seaMesh)


  let mapFloor = new THREE.Mesh(
    new CylinderGeometry(18.5, 18.5, MAX_HEIGHT * 0.1, 50),
    new MeshPhysicalMaterial({
      envMap: textureCube,
      map: textures.dirt2,
      envMapIntensity: 0.1, 
      side: THREE.DoubleSide,
    })
  );
  mapFloor.receiveShadow = true;
  mapFloor.position.set(0, -MAX_HEIGHT * 0.05, 0);
  scene.add(mapFloor);

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
  renderer.shadowMap.enabled = true;



  /**
   * LIght
   */

  const light = new THREE.PointLight(new THREE.Color("#ffcb8e").convertSRGBToLinear().convertSRGBToLinear(), 80, 200)
  light.position.set(10, 20, 10)
  light.castShadow = true
  // light.shadow.mapSize.width = 512
  // light.shadow.mapSize.height = 512

  // light.shadow.camera.near = 0.55
  // light.shadow.camera.far = 500

  scene.add(light)

  scene.add(new THREE.PointLightHelper(light))
  scene.add(new THREE.CameraHelper(light.shadow.camera))

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


