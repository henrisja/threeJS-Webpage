let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
const mixers = [];
const clock = new THREE.Clock();

function init()  {

    container = document.querySelector( '#scene-container' );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );

    createCamera();
    createControls();
    createLights();
    createStars();
    createModels();
    createRenderer();

    renderer.setAnimationLoop( () => {

        update();
        render();

    } );
}

function createCamera() {

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set( 0, 0, 30 );

}

function createControls() {

    controls = new THREE.OrbitControls( camera, container );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];

}

function createLights()  {
    
    const lightOne = new THREE.DirectionalLight( 0xffffff );
    lightOne.position.set( 20, 20, 20 );

    const lightTwo = new THREE.DirectionalLight( 0x002288 );
    lightTwo.position.set( -20, -20, -20 );

    const mainLight = new THREE.AmbientLight( 0x222222 );
    
    scene.add( lightOne, lightTwo, mainLight );

}

function createStars()  {

    let starGeometry = new THREE.Geometry();
    for( let i = 0; i < 10000; i++ )
    {
        let star = new THREE.Vector3();
        star.x = THREE.Math.randFloatSpread( 2000 );
        star.y = THREE.Math.randFloatSpread( 2000 );
        star.z = THREE.Math.randFloatSpread( 2000 );

        starGeometry.vertices.push( star );
    }

    let starMaterial = new THREE.PointsMaterial( {color: 0x888888} );
    let starField = new THREE.Points( starGeometry, starMaterial );

    starField.name = "stars";

    scene.add( starField );

}

function createModels()  {

    let loader = new THREE.GLTFLoader();

    loader.load( 'Parrot.glb', function ( gltf ) {

        let modelOne = gltf.scene.children[ 0 ];

        let s = 0.3;
        modelOne.scale.set( s, s, s );
        modelOne.castShadow = true;
        modelOne.receiveShadow = true;

        //meshOne.position.x = -10;
        //meshOne.position.y = 1;

        const parrotAnimation = gltf.animations[ 0 ];
        const parrotMixer = new THREE.AnimationMixer( modelOne );
        mixers.push( parrotMixer );
        const parrotAction = parrotMixer.clipAction( parrotAnimation );
        parrotAction.play();

        scene.add( modelOne );

    } );
    
    /*
    loader.load( 'tree.glb', function ( gltf ) {

        let meshTwo = gltf.scene.children[ 0 ];

        scene.add( meshTwo );

    } );
    */

}

function createRenderer()  {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

}

function update()  {

    const delta = clock.getDelta();
    mixers.forEach( (mixer) => {mixer.update( delta ); } );

}

function render()  {

    renderer.render( scene, camera );

}

function onWindowResize()  {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );

}

window.addEventListener( 'resize', onWindowResize );

init();