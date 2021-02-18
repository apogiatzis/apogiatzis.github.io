
// Get configurations
// --------------------------------------------------------------------------------


var element = document.getElementById("astroidzStyles");

function convertHexToThreeColor(color){
	if( color ){
		color = parseInt ( color.replace("#","0x"), 16 );
		color = new THREE.Color( color );
		return color;
	}
}



// Do not edit below this line
// --------------------------------------------------------------------------------

var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}


var camera, scene, renderer, composer,mouseX , mouseY, speed,
	asteroids, starfield, object, planet, light, bgsphere, effectBloom, effectFilm,
	effectHBlur, effectVBlur, GlitchUniforms,
	glitchPass, rgbEffect;
	mouseX = 0, mouseY = 0,
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2,
	width = windowHalfX,
	height = windowHalfY;


var settingsData = {};
if( element ){
	
	var settingsData = {

		asteroidsQuantity: element.getAttribute('data-astroidz-quantity'),

		glitchPass: element.getAttribute('data-astroidz-glitchPass'),
		effectFilm: element.getAttribute('data-astroidz-effectFilm'),
		effectBlur: element.getAttribute('data-astroidz-effectBlur'),

		light0: element.getAttribute('data-astroidz-light0'),
		light1: element.getAttribute('data-astroidz-light1'),
		light2: element.getAttribute('data-astroidz-light2'),
		light3: element.getAttribute('data-astroidz-light3'),

		light0i: element.getAttribute('data-astroidz-light0i'),
		light1i: element.getAttribute('data-astroidz-light1i'),
		light2i: element.getAttribute('data-astroidz-light2i'),
		light3i: element.getAttribute('data-astroidz-light3i'),

		material1: element.getAttribute('data-astroidz-material1'),
		material2: element.getAttribute('data-astroidz-material2')
	};
	// init();
	// animate();
}





function init() {
	renderer = new THREE.WebGLRenderer( { alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.id = 'astroidzContainer';


	// camera
	// =============================================================================
	camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 550;
	scene = new THREE.Scene();

	// asteroids
	// =============================================================================
	asteroids = new THREE.Object3D();
	asteroidsHolder = new THREE.Object3D();
	asteroidsHolder.add( asteroids );
	scene.add( asteroidsHolder );

	var matcolor1 = 0x999999;
	if( settingsData.material1){
		matcolor1 =  settingsData.material1.split('#').join('0x');
	}

	var geometry = new THREE.SphereBufferGeometry( 1 , 4, 4 ),
		material = new THREE.MeshStandardMaterial( { color: 1 * matcolor1, flatShading: true, roughness: 0.0 } ),
		sides = 6,
		size = 0.06,
		size2 = 0.06,
		mesh;


	

	for ( var i = 0; i < settingsData.asteroidsQuantity ; i ++ ) {
		// all different sizes
		sides = 3;// + Math.floor( Math.random() * 2 );
		size = 0.2 + ( Math.random() / 2 );
		size2 = 0;//0.1 + ( Math.random() / 3 );
		geometry = new THREE.CylinderGeometry( 0, size, size2, sides );
		// geometry = new THREE.SphereBufferGeometry( size   , sides,  sides ); // spheres type
		mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( 
			Math.random() - 0.5,
			(Math.random() / 10 ) - 0.1, 
			Math.random() - 0.5 ).normalize();
		mesh.position.multiplyScalar( 440 + (Math.random() * 220) );
		mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
		asteroids.add( mesh );
	}

	// sphere
	// =============================================================================
	var geometry = new THREE.IcosahedronBufferGeometry( 240, 1 );
	var count = geometry.attributes.position.count;
	var colors = [];
	var color = new THREE.Color();
	var matcolorSphere = 0xdddddd;
	if( settingsData.material2 ){
		matcolorSphere =  settingsData.material2.split('#').join('0x');
	}
	var materialSphere = new THREE.MeshStandardMaterial( { color: 1 * matcolorSphere, flatShading: true, roughness: 0.0 } );
	for ( var i = 0; i < count; i += 3 ) {
		color.setHex( 1 * matcolorSphere );
		colors.push( color.r, color.g, color.b );
		colors.push( color.r, color.g, color.b );
		colors.push( color.r, color.g, color.b );
	}
	geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
	sphere = new THREE.Mesh( geometry, materialSphere );
	planet = new THREE.Object3D();
	planetHolder = new THREE.Object3D();
	planetHolder.add( planet );
	planet.add( sphere );
	scene.add( planetHolder );

	// Items rotation
	// =============================================================================
	planetHolder.rotation.z = -0.5;
	asteroidsHolder.rotation.z = -0.5;

	// Stars
	// =============================================================================
	var starsGeometry = new THREE.Geometry();
	for ( var i = 0; i < 10000; i ++ ) {
		var star = new THREE.Vector3();
		star.x = THREE.Math.randFloatSpread( 40000 );
		star.y = THREE.Math.randFloatSpread( 1500 );
		star.z = THREE.Math.randFloatSpread( 2000 );
		starsGeometry.vertices.push( star );
	}
	var starsMaterial = new THREE.PointsMaterial( { color: 0x999999 } );
	starfield = new THREE.Points( starsGeometry, starsMaterial );
	starfield.position.z = 100;
	scene.add( starfield );

	// Light
	// =============================================================================
	
	// Ambient light
	var ambientLightColor = 0x010101;
	if( settingsData.light0 ){
		ambientLightColor =  settingsData.light0.split('#').join('0x');
		ambientLightColor = parseInt ( ambientLightColor, 16 );
	}
	var ambientLightIntensity = 1;
	if( settingsData.light0i ){
		ambientLightIntensity = parseFloat( settingsData.light0i );
	}
	scene.add( new THREE.AmbientLight( ambientLightColor, 1 ) );
	


	// first light
	var light1Color = 0xffffff;
	if( settingsData.light1 ){
		light1Color =  settingsData.light1.split('#').join('0x');
		light1Color = parseInt ( light1Color, 16 );
	}
	var light1_intensity = 1;
	if( settingsData.light1i ){
		light1_intensity = parseFloat( settingsData.light1i );
	}
	var light1 = new THREE.DirectionalLight( light1Color, light1_intensity );
	light1.position.set( -2, 1, -0.53 );
	scene.add( light1 );

	// second light
	var light2Color = 0xffffff;
	if( settingsData.light2 ){
		light2Color =  settingsData.light2.split('#').join('0x');
		light2Color = parseInt ( light2Color, 16 );
	}
	var light2_intensity = 1;
	if( settingsData.light2i ){
		light2_intensity = parseFloat( settingsData.light2i );
	}
	var light2 = new THREE.DirectionalLight( light2Color, light2_intensity );
	light2.position.set( -1, 2, -1.4 );
	scene.add( light2 );

	// third light
	var light3Color = 0xffffff;
	if( settingsData.light3){
		light3Color =  settingsData.light3.split('#').join('0x');
		light3Color = parseInt ( light3Color, 16 );
	}
	var light3_intensity = 1;
	if( settingsData.light3i ){
		light3_intensity = parseFloat( settingsData.light3i );
	}
	var light3 = new THREE.DirectionalLight( light3Color, light3_intensity );
	light3.position.set( 1, -2, -1.5 );
	scene.add( light3 );
	
	// rendering
	// =============================================================================
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );

	// Blur
	if(settingsData.effectBlur){
		effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
		effectHBlur.uniforms[ 'h' ].value = 0.25 / ( width );
		effectVBlur.uniforms[ 'v' ].value = 0.25 / ( width );
		composer.addPass( effectHBlur );
		composer.addPass( effectVBlur );
	}

	// FilmPass
	if(settingsData.effectFilm){
		effectFilm = new THREE.FilmPass( 0.5, 0.2, 2300, false );
		composer.addPass( effectFilm );
	}

	// Glitch
	
	if(settingsData.glitchPass){
		glitchPass = new THREE.GlitchPass(30);
		composer.addPass( glitchPass );
	}
	

	// RGB
	// =============================================================================
	rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
    rgbEffect.uniforms['amount'].value = 0.0012;
    rgbEffect.renderToScreen = true; // add as last
    composer.addPass( rgbEffect );
	// resize
	window.addEventListener( 'resize', onWindowResize, false );
}



function onWindowResize() {
	windowHalfX = window.innerWidth / 4;
	windowHalfY = window.innerHeight / 4;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );
}

var invDistX = 0,
	absMouseX,
	npx,
	distance, delta, deltaAbs = 500;

function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX )  * 2;
	mouseY = ( event.clientY - windowHalfY ) * 2;
	distance = 350 + ( ((Math.abs(mouseX) / windowHalfX) / 2 ) * 150 );
}

function animate() {

	var canAnimate = true;
	if('object' === typeof( jQuery.viceelementaaor )){
		if('function' === typeof( jQuery.viceelementaaor.countFps )){
			if(jQuery.viceelementaaor.fps < 15){
				canAnimate = false;
			} else {
				canAnimate = true;
			}
		}
	}
	requestAnimationFrame( animate );
	if( true === canAnimate ){
		
		speed = .0005;
		// asteroids
		asteroids.rotation.y += 0.0005;
		// stars
		starfield.rotation.y += 0.00001;
		// sphere
		planet.rotation.y += .0025;
		// camera
		delta = mouseX / windowHalfX ;
		deltaY = mouseY / windowHalfY ;
		deltaAbs = ( 500 + ( delta * 100 ) );
		camera.position.z += ( deltaAbs - camera.position.z ) * .0005;
		// planet.rotation.y +=delta * .005;
		// planet.rotation.x +=deltaY * .005;
		camera.position.y += ( mouseY - camera.position.y ) * .002;
		camera.lookAt( scene.position );
		composer.render();
	}
}
// remove glitch after a while
if(settingsData.glitchPass){
	var clearPass = setTimeout(function(){ glitchPass.enabled = false; }, 4000);
}
