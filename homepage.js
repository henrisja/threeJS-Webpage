let container;
let camera;
let controls;
let renderer;
let scene;
let mesh;
let raycaster;
let mouse = new THREE.Vector2(), INTERSECTED;
let anemoneIntersect = false;
let tokyoIntersect = false;

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
    
    loader.load( 'Parrot.glb', function ( gltf ) {

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
    
    
    THREE.DRACOLoader.setDecoderPath('js/libs/draco/gltf/');
    loader.setDRACOLoader( new THREE.DRACOLoader() );
    loader.load( 'LittlestTokyo.glb', function ( gltf )  {

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

    let newLoader = new THREE.FBXLoader();
    newLoader.load( 'anemone.fbx', function ( object )  {

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

    //mixers.forEach( ( mixer ) => { mixer.update( delta ); } );

    /*
    if( anemoneIntersect ){
        mixers[ 0 ].update( delta );
    }
    
    if( tokyoIntersect ){
        mixers[ 1 ].update( delta );
    }
    */

}

function render()  {

    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children, true );

    if( intersects.length > 0 && intersects[ 0 ].object.name != "stars"){

        if( INTERSECTED != intersects[ 0 ].object.name){

            INTERSECTED = intersects[ 0 ].object.name;
            
            if( INTERSECTED == "anemone"){
                anemoneIntersect = true;
                console.log("intersect");
            }

            /*
            else if( INTERSECTED == "tokyo"){
                tokyoIntersect = true;
                console.log("tokyo");
            }
            */
        }
    }

    else{
        
        if( INTERSECTED == "anemone"){
            anemoneIntersect = false;
        }
        /*
        else if( INTERSECTED == "tokyo"){
            tokyoIntersect = false;
        }
        */
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