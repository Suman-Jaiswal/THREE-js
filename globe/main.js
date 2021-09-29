import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertex from './shaders/atmosphereVertex.glsl'
import atmosphereFragment from './shaders/atmosphereFragment.glsl'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
)

camera.position.z = 15

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

// <<<<< creation >>>>>

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial()
const starVertices = []
for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = -Math.random() * 2000 - 100
    starVertices.push(x, y, z)
    
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(
    starGeometry, starMaterial
)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            globeTexture: {
                value: new THREE.TextureLoader().load('./img/globe.jpg')
            }
        }
    })
)
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
)

atmosphere.scale.set(1.2, 1.2, 1.2)

scene.add(stars)
scene.add(sphere)
scene.add(atmosphere)

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const mouse = {
    x: 0,
    y: 0    
}
// animation >>>
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    sphere.rotation.y += 0.002
    gsap.to(group.rotation, {
        x: - mouse.y * 0.3,
        y: mouse.x * 0.3,
        duration: 2
    })
}
animate()

addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1,
    mouse.y = - (e.clientY / innerHeight) * 2 - 1
})
