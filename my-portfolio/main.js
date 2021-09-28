import './style.css'

import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as dat from 'dat.gui';
const gui = new dat.GUI()
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegments: 70,
        heightSegments: 70
    }
}
gui.add(world.plane, 'width', 1, 500).onChange(re_generate_plane)
gui.add(world.plane, 'height', 1, 500).onChange(re_generate_plane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(re_generate_plane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(re_generate_plane)

function re_generate_plane() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    )
    const { array } = planeMesh.geometry.attributes.position
    const randomValues = []
    for (let i = 0; i < array.length; i += 3) {
        const x = array[i];
        const y = array[i + 1]
        const z = array[i + 2]
        
        array[i] = x + (Math.random() - 0.5)*3
        array[i+1] = y + (Math.random() - 0.5)*3
        array[i + 2] = z + (Math.random() - 0.5)*5
    
        randomValues.push(Math.random()-0.5)
        randomValues.push(Math.random()-0.5)
        randomValues.push(Math.random()-0.5)
    }
    planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array
    planeMesh.geometry.attributes.position.randomValues = randomValues
    
    const colors = []
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, .19, .4)
    }
    
    planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

const rayCaster = new THREE.Raycaster()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)

document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width, 
    world.plane.height, 
    world.plane.widthSegments, 
    world.plane.heightSegments
    )

const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)

re_generate_plane()

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 2)
scene.add(light)
const light1 = new THREE.DirectionalLight(0xffffff, 1)
light1.position.set(0, 0, -2)
scene.add(light1)

camera.position.z = 70;

const mouse = {
    x: undefined,
    y: undefined
}

let frame = 0
function animate() {
    frame += 0.01
    requestAnimationFrame(animate);
    renderer.render(scene, camera)
    rayCaster.setFromCamera(mouse, camera)
    const intersects = rayCaster.intersectObject(planeMesh)

    const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position

    for (let i = 0; i < array.length; i+=3) {
       array[i] = originalPosition[i] + Math.cos(frame + randomValues[i])*0.003
       array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1])*0.003
        
    }

    planeMesh.geometry.attributes.position.needsUpdate = true

    if (intersects.length > 0) {
        const {color} =   intersects[0].object.geometry.attributes

        color.setX(intersects[0].face.a, .1)
        color.setY(intersects[0].face.a, .5)
        color.setZ(intersects[0].face.a, 1)

        color.setX(intersects[0].face.b, .1)
        color.setY(intersects[0].face.b, .5)
        color.setZ(intersects[0].face.b, 1)

        color.setX(intersects[0].face.c, .1)
        color.setY(intersects[0].face.c, .5)
        color.setZ(intersects[0].face.c, 1)

        color.needsUpdate = true
        const initials = {
            r: 0,
            g: 0.19,
            b: 0.4
        }
        const hover = {
            r: 0.1,
            g: 0.5,
            b: 1
        }
        gsap.to(hover, {
            r: initials.r,
            g: initials.g,
            b: initials.b,
            onUpdate: () => {
                color.setX(intersects[0].face.a, hover.r)
                color.setY(intersects[0].face.a, hover.g)
                color.setZ(intersects[0].face.a, hover.b)
        
                color.setX(intersects[0].face.b, hover.r)
                color.setY(intersects[0].face.b, hover.g)
                color.setZ(intersects[0].face.b, hover.b)
        
                color.setX(intersects[0].face.c, hover.r)
                color.setY(intersects[0].face.c, hover.g)
                color.setZ(intersects[0].face.c, hover.b)
            }
        })
    }
}

animate()

addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = -(e.clientY / innerHeight) * 2 + 1
})