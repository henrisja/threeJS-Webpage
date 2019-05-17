let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
let raycaster;
let mouse = new THREE.Vector2(), INTERSECTED;
let parrotAnimation;
let parrotMixer;
let parrotAction;
let parrotIntersect = false;

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

        modelOne.position.x = -10;
        modelOne.position.y = 1;

        parrotAnimation = gltf.animations[ 0 ];
        parrotMixer = new THREE.AnimationMixer( modelOne );
        mixers.push( parrotMixer );
        parrotAction = parrotMixer.clipAction( parrotAnimation );
        parrotAction.play();

        modelOne.name = "parrot";

        scene.add( modelOne );

    } );

    raycaster = new THREE.Raycaster();

}

function createRenderer()  {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

}

function update()  {

    const delta = clock.getDelta();

    if( !parrotIntersect ){
        //console.log("Bail");
        return;
    }

    mixers.forEach( (mixer) => {mixer.update( delta ); } );

}

function render()  {

    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children, true );

    if( intersects.length > 0 && intersects[ 0 ].object.name != "stars"){
        if( INTERSECTED != intersects[ 0 ].object){

            INTERSECTED = intersects[ 0 ].object;
            //console.log("Intersect");
            parrotIntersect = true;

        }
    }
    else{

        parrotIntersect = false;
        INTERSECTED = null;

    }

    renderer.render( scene, camera );

}

function onWindowResize()  {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );

}

function onDocumentMouseMove( event )  {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = ( event.clientY / window.innerHeight ) * 2 - 1;

}

window.addEventListener( 'resize', onWindowResize );
window.addEventListener( 'mousemove', onDocumentMouseMove, false );

init();