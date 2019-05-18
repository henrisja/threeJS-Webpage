let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
let raycaster;
let mouse = new THREE.Vector2(), INTERSECTED;
let tokyoIntersect, anemoneIntersect, parrotIntersect = false;

const intersectObjects = [];
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
    createIntersectBoxes();
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

    camera.position.set( 0, 0, 60 );

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
    
    loader.load( 'models/Parrot.glb', function ( gltf ) {

        let modelOne = gltf.scene.children[ 0 ];

        let s = 0.2;
        modelOne.scale.set( s, s, s );
        modelOne.castShadow = true;
        modelOne.receiveShadow = true;

        modelOne.position.x = -30;

        const parrotAnimation = gltf.animations[ 0 ];
        const parrotMixer = new THREE.AnimationMixer( modelOne );
        mixers.push( parrotMixer );
        const parrotAction = parrotMixer.clipAction( parrotAnimation );
        parrotAction.play();

        modelOne.name = "parrot";

        scene.add( modelOne );

    } );

    let newLoader = new THREE.FBXLoader();
    newLoader.load( 'models/anemone.fbx', function ( object )  {

        let s = 2;
        object.scale.set( s, s, s );
        object.castShadow = true;
        object.receiveShadow = true;

        object.position.x = 26;
        object.position.y = -3;

        const aMixer = new THREE.AnimationMixer( object );
        mixers.push( aMixer );
        const aAction = aMixer.clipAction( object.animations[ 0 ] );
        aAction.play();

        object.name = "anemone";

        scene.add( object );

    } );

    THREE.DRACOLoader.setDecoderPath('js/libs/draco/gltf/');
    loader.setDRACOLoader( new THREE.DRACOLoader() );
    loader.load( 'models/LittlestTokyo.glb', function ( gltf )  {

        let modelTwo = gltf.scene.children[ 0 ];

        let s = 0.03;
        modelTwo.scale.set( s, s, s );
        modelTwo.castShadow = true;
        modelTwo.receiveShadow = true;

        modelTwo.position.y = 3;
        modelTwo.rotateZ( Math.PI/2 ); 

        const tokyoAnimation = gltf.animations[ 0 ];
        const tokyoMixer = new THREE.AnimationMixer( modelTwo );
        mixers.push( tokyoMixer );
        const tokyoAction = tokyoMixer.clipAction( tokyoAnimation );
        tokyoAction.play();

        modelTwo.name = "tokyo";

        scene.add( modelTwo );

    } );
    
    raycaster = new THREE.Raycaster();

}

function createIntersectBoxes() {

    let geometry = new THREE.BoxGeometry( 14, 6, 15 );
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    material.transparent = true;
    material.opacity = 0;
    let parrotCube = new THREE.Mesh( geometry, material );

    parrotCube.position.x = -30
    parrotCube.position.z = -3;

    parrotCube.name = "parrot";
    intersectObjects.push( parrotCube );

    scene.add( parrotCube );


    geometry = new THREE.BoxGeometry( 15, 12, 15 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    material.transparent = true;
    material.opacity = 0;
    let tokyoCube = new THREE.Mesh( geometry, material );

    tokyoCube.position.y = 3;
    tokyoCube.position.z = 2.5;

    tokyoCube.name = "tokyo";
    intersectObjects.push( tokyoCube );

    scene.add( tokyoCube );

    geometry = new THREE.BoxGeometry( 8, 10, 8 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    material.transparent = true;
    material.opacity = 0;
    let anemoneCube = new THREE.Mesh( geometry, material );

    anemoneCube.position.x = 26;
    anemoneCube.position.y = 0;
    anemoneCube.position.z = 2;

    anemoneCube.name = "anemone";
    intersectObjects.push( anemoneCube );

    scene.add( anemoneCube );
}

function createRenderer()  {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

}

function update()  {

    const delta = clock.getDelta();

    if(mixers.length == 3){

        if( parrotIntersect ){
            mixers[ 0 ].update( delta );
        }
    
        if( tokyoIntersect ){
            mixers[ 2 ].update( delta );
        }

        if( anemoneIntersect ){
            mixers[ 1 ].update( delta );
        }
    }

}

function render()  {

    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( intersectObjects );

    if( intersects.length > 0){

        if( INTERSECTED != intersects[ 0 ].object.name){

            INTERSECTED = intersects[ 0 ].object.name;
            
            if( INTERSECTED == "parrot"){
                parrotIntersect = true;
                console.log("parrot");
            }

            else if( INTERSECTED == "tokyo"){
                tokyoIntersect = true;
                console.log("tokyo");
            }
            
            else if( INTERSECTED == "anemone"){
                anemoneIntersect = true;
                console.log("anemone");
            }
        }
    }

    else{
        
        if( INTERSECTED == "parrot"){
            parrotIntersect = false;
        }
        
        else if( INTERSECTED == "tokyo"){
            tokyoIntersect = false;
        }
        
        else if (INTERSECTED == "anemone"){
            anemoneIntersect = false;
        }

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