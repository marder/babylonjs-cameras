import { ICameraInput, PointerInfo, PointerEventTypes, Plane, Matrix, Vector3, Observer, FreeCamera } from "babylonjs";

export class MousePanInputs implements ICameraInput<FreeCamera>  {

	private _pointerObserver: Observer<PointerInfo>

	public camera: FreeCamera;
	public checkInputs?: () => void;
	public mouseButton = 0;

	/**
	 * This plane is used, to locate the pointed coordinate.
	 * It can be overwritten, but take in mind. It's normal should point to camera.
	 */
	public plane = Plane.FromPositionAndNormal(Vector3.Zero(), Vector3.Up());

	/**
	 * Attach `pointerdown`, `pointerup`, `pointermove` events to `element`
	 * @param element The element, where the events will be attached
	 * @param noPreventDefault 
	 */
	public attachControl( element: HTMLElement, noPreventDefault?: boolean ) {

		if ( this._pointerObserver )
			return;

		const scene = this.camera.getScene();
		
		this._pointerObserver = scene.onPointerObservable.add(this.onPointer.bind(this));

	}
	public detachControl( element: HTMLElement ) {

		if (this._pointerObserver) {
			let scene = this.camera.getScene();
			scene.onPointerObservable.remove(this._pointerObserver);
		}

	}


	// Pointer properties
	protected _pointerDown = false;
	protected _firstPoint: Vector3;
	protected _lastPoint: Vector3;
	protected _currentPoint: Vector3;

	private onPointer(pointerInfo: PointerInfo) {
		switch (pointerInfo.type) {
			case PointerEventTypes.POINTERDOWN: return this.beginPan(pointerInfo.event as PointerEvent);
			case PointerEventTypes.POINTERMOVE: return this.onPointerMove(pointerInfo.event as PointerEvent);
			case PointerEventTypes.POINTERUP: return this.endPan(pointerInfo.event as PointerEvent);
		}
	}

	private beginPan( event: PointerEvent ) {

		if ( event.button == this.mouseButton ) {

			this._pointerDown = true;
			this._lastPoint = this._firstPoint = this.getPointOnPlane( event );

		}

	}
	private endPan( event: PointerEvent ) {

		if ( event.button == this.mouseButton ) {

			// Last move event
			this.onPointerMove(event);

			this._pointerDown = false;
		}

	}
	private onPointerMove( event: PointerEvent ) {

		// Instant return, if pointer isn't down.
		if ( !this._pointerDown )
			return;


		let plane = this.plane;

		if ( !plane ) {
			console.error( "Plane is not defined." );
			return;
		}

		// Calculate new points

		this._currentPoint = this.getPointOnPlane( event );

		let translation = this._lastPoint.subtract( this._currentPoint );
		let matrix = Matrix.Translation( translation.x, translation.y, translation.z );
		this.camera.position = Vector3.TransformCoordinates( this.camera.position, matrix );

		console.log({
			translation,
			lastPoint: this._lastPoint,
			currentPoint: this._currentPoint
		})

		// Update remembered points

		this._lastPoint = this._currentPoint;

	}


	// Helper functions
	private getPointOnPlane( event: PointerEvent ) {
		const scene = this.camera.getScene();
		const ray = scene.createPickingRay( event.offsetX, event.offsetY, Matrix.Identity(), this.camera );
		const d = ray.intersectsPlane( this.plane );
		return ray.origin.add( ray.direction.scale( d ) );
	}

	public getClassName(): string {
		return "FinePanInputs";
	}
	public getSimpleName(): string {
		return "mousepan";
	}

}