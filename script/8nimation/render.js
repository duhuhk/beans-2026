// a request to render something
class RenderRequest{
	constructor(renderer, priority, queue){
		this.render = renderer;
		this.priority = priority;
		
		queue.append(this);
	}
}

class RenderQueue extends Array{
	constructor(...theGoods){
		super(...theGoods);
	}
	
	// to add things to queue
	// (while also keeping somewhat distinct from normal array)
	append(...args){ return this.push(...args); }
	
	// handle everything inside, rendering in the correct order
	process(){
		// sort for rendering order
		// higher priority number -> drawn in front
		this.sort((a, b) => a.priority - b.priority);
		
		// render everything
		for(let r of this){
			r.render();
		}
		
		// empty self
		this.length = 0;
	}
}

// render queue
// emptied after every frame; repopulate it with RenderRequests for a frame
const RENDERQUEUE = new RenderQueue();	// list of things to render