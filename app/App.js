import Stats from 'stats.js'
import { GUI } from 'dat.gui'
import { Clock, Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { AxesHelper, MeshBasicMaterial } from 'three'
import DefaultVertexShaderGLSL from './shaders/DefaultVertexShader.glsl'
import DefaultFragmentShaderGLSL from './shaders/DefaultFragmentShader.glsl'

export default class App {

  constructor() {

    this.config = {
      // add gui parameters here
    }

    this.init()

    this.createGUI()
    this.createWorld()

    this.update()
  }



  ///////////////////////////////////////////////////////////////////////////////
  //// INIT & CREATION
  ///////////////////////////////////////////////////////////////////////////////

  init() {

    // Canvas element
    this.containerEl = document.body.querySelector(`#container`)
    this.objectEl = this.containerEl.querySelector(`#object`)
    this.canvasEl = this.objectEl.querySelector(`canvas`)

    this.aspectRatio = this.objectEl.clientWidth / this.objectEl.clientHeight

    // Clock
    this.clock = new Clock()
    this.clock.start()

    // Scene
    this.scene = new Scene()

    // Camera
    //  ↪ Aspect ratio set to arbitrary value of 1, resizing function updates to correct aspect
    this.camera = new PerspectiveCamera(70, 1, 0.01, 1000)
    this.camera.position.z = 150
    this.camera.position.y = 150
    this.scene.add(this.camera)

    // Renderer
    this.renderer = new WebGLRenderer({ canvas: this.canvasEl, antialias: true })
    this.renderer.setClearColor(0x000000)

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.update()

    new ResizeObserver(() => this.handleContainerResize()).observe(this.containerEl)
  }


  createGUI() {

    // Dat Gui
    const gui = new GUI()

    // Stats
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)
  }


  createWorld() {

    // Floor plane
    // const floorMesh = new Mesh(
    //   new PlaneGeometry(1000, 1000, 50, 50),
    //   new MeshBasicMaterial({ color: 0x333333, wireframe: true })
    // )
    // floorMesh.rotation.x = Math.PI / 2
    // this.scene.add(floorMesh)

    // Axes Helper
    // const axesHelper = new AxesHelper(100)
    // this.scene.add(axesHelper)

    // Plane with custom shader
    this.scene.add(new Mesh(
      new PlaneGeometry(100, 100, 1, 1),
      new ShaderMaterial({
        vertexShader: DefaultVertexShaderGLSL,
        fragmentShader: DefaultFragmentShaderGLSL
      })
    ))

  }



  ///////////////////////////////////////////////////////////////////////////////
  //// UPDATE LOOP
  ///////////////////////////////////////////////////////////////////////////////

  update() {
    requestAnimationFrame(() => this.update())

    this.stats.begin()

    this.controls.update()

    this.renderer.render(this.scene, this.camera)

    this.stats.end()
  }



  ///////////////////////////////////////////////////////////////////////////////
  //// RESIZING
  ///////////////////////////////////////////////////////////////////////////////

  // The container div has resized
  //  ↪ Keep 'object' div within the container respecting its set aspect ratio (contain)
  //  ↪ Update the three.js renderer, camera aspect, ...
  handleContainerResize() {

    const { containerEl, aspectRatio, objectEl, renderer, camera } = this

    // Set object style width/height to auto (simulates a css display 'contain')
    const isTall = containerEl.clientWidth / containerEl.clientHeight < aspectRatio
    objectEl.style.width = isTall ? '100%' : 'auto'
    objectEl.style.height = isTall ? 'auto' : '100%'

    // Update three.js stuff
    //  ↪ See: https://stackoverflow.com/a/45046955/341358
    const canvas = renderer.domElement

    // Look up the size the canvas is being displayed
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    // Adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {

      // Update renderer & camera
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      // TODO: Update any render target sizes here
      // ...
    }
  }

}
