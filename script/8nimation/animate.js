// animator list
var ANIMATORS = [];	// list of functions to run for animation
/* 
	to use animators:
		ANIMATORS = [animFn1{, [animArgs1]}, animFn2{, [animArgs2]}, ... , animFnN{, animArgsN}]
	for some functions animFn_ and optional arrays of arguments animArgs_
	where {...} shows optional indices for ANIMATORS
	
	animate() automatically uses all animators in ANIMATORS
	on its automatically set requestAnimationFrame loop
*/

// dynamically load animator scripts in
//
// CAUTION: dynamically loaded animators must contain a function of the same
//          name as the file! this is the function considered the animator!
async function loadAnimator(animatorPath, ...animatorArguments){
	// get function name from path:
	let fnName = animatorPath;
	// ... lose subdirectories:
	//     take only text after last \ or /
	fnName = fnName.split(/(\/|\\)/).pop();
	// ... lose all (supposed) file extensions:
	//     take only text before first .
	fnName = fnName.split(/\./).shift();
	
	// load actual script file
	let animator = await dynamicLoadScript(animatorPath);
	// get reference to animator function
	// TODO: make less of a hackjob
	let animatorFn = globalThis[fnName];
	
	// add to ANIMATORS list
	ANIMATORS.push(animatorFn);
	// (and arguments, if any)
	if(animatorArguments.length){
		ANIMATORS.push([...animatorArguments]);
	}
	
	// hackjob retrieve function by string
	return animatorFn;
}

// function called in requestAnimationFrame to animate
async function animate(){
	// figure out render function calls
	// ANIMATORS array should contain these!!
	let animators = Array.from(ANIMATORS);	// DEEP COPY!
	while(animators.length){
		animationFn = animators.shift();
		if(typeof animators[0] == 'function' || !animators.length){
			// if next animator is a function or this is the last animator,
			// skip passing arguments
			animationFn();
			continue;
		}
		animationArgs = animators.shift();	// array of arguments to pass
		animationFn(...animationArgs);
	}
	
	// process rendering queue
	RENDERQUEUE.process();
	
	// update timings and request next frame
	updateTimes({bundle: false});
	aframe = window.requestAnimationFrame(animate);
}