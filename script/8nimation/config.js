// configuration object to store data for animation initialisation
class OON_Config{
	// CONSTRUCTOR
	constructor(canvas, context, initFn){
		this.canvas = canvas;
		this.context = context;
		this.init = initFn;
	}
	
	// DEPENDENCIES
	// to add a dependency
	require(name, promise){
		this.depNames.push(name);
		this.depProms.push(promise);
	}
	// stores dependency info for resolution
	depNames = [];
	depProms = [];
	async resolveDependencies(){
		// return an object containing each dependency added with this.require()
		// such that every (key, value) = (name, promise's return value)
		let deps = {};
		await Promise.all(this.depProms).then(d => {
			for(let i in d){
				let n = this.depNames[i];
				let p = d[i];
				deps[n] = p;
			}
		});
		return deps;
	}
}