import { ICameraInput, FreeCamera, PointerInfo, EventState, Observer, PointerEventTypes, Plane, Vector3, Matrix, Ray, Vector2 } from 'babylonjs'

export class FreeCameraCadMouseInput implements ICameraInput<FreeCamera> {

	// Default left button
	MOUSE_PAN = [0, 1];

	camera: FreeCamera;

	_pointerInput: (e: PointerInfo, s: EventState) => void
	_observer: Observer<PointerInfo>

	getClassName(): string {
		return "FreeCameraCadMouseInput";
	}
	getSimpleName(): string {
		return "cad-mouse";
	}

	attachControl(element: HTMLElement) {

		var engine = this.camera.getEngine();
		var scene = this.camera.getScene();
		var ray = new Ray(Vector3.Zero(), Vector3.Zero());

		if (!this._pointerInput) {

			let _panEnabled = false;
			/** Parallel plane to camera */
			let _pointerPlane = Plane.FromPositionAndNormal(Vector3.Zero(), Vector3.Up());
			/** Position of cursor, when panning started */
			let _startPointer = new Vector2(0, 0);
			/** Position of cursor in previous call */
			let _previousPointer = new Vector2(0, 0);
			/** Current cursor position */
			let _currentPointer = new Vector2(0, 0);
			/** The pointer position on the plane on pointer down */
			let _startTarget = Vector3.Zero();
			/** The pointer position on the plane on last pointer move */
			let _previousTarget = Vector3.Zero();
			/** The current pointer position on the plane */
			let _currentTarget = Vector3.Zero();
			/** Position of camera, when panning started. */
			let _startCameraPosition = Vector3.Zero();

			const cast = (p: Vector2, target: Vector3) => {
				const ray = scene.createPickingRay(p.x, p.y, Matrix.Identity(), this.camera);
				const rayPlaneDistance = ray.intersectsPlane(_pointerPlane);
				const hits = rayPlaneDistance > 0.001
				return ray.origin.addToRef(ray.direction.scale(rayPlaneDistance), target);
			}

			// Define the pointer observable callback
			this._pointerInput = p => {

				let evt = <PointerEvent>p.event;

				if (engine.isInVRExclusivePointerMode) {
					return;
				}

				_currentPointer = new Vector2(evt.offsetX, evt.offsetY);)

				let srcElement = <HTMLElement>(evt.srcElement || evt.target);

				if (p.type == PointerEventTypes.POINTERDOWN) {

					if (this.checkPanInput(evt)) {
						srcElement.setPointerCapture(evt.pointerId);
						_panEnabled = true;
						_startTarget.copyFrom(_currentTarget);
						_startPointer.copyFrom(_currentPointer);
						_startCameraPosition.copyFrom(this.camera.position);
					}

				} else if (p.type == PointerEventTypes.POINTERMOVE) {

					if (!engine.isPointerLock) {

						if (_panEnabled) {

							cast(_currentPointer, _currentTarget);
							cast(_startPointer, _startTarget)

							const vector = _currentTarget.subtract(_startTarget);
							this.camera.position = _startCameraPosition.add(vector.negate());
						}

					}

				} else if (p.type == PointerEventTypes.POINTERUP) {

					if (this.checkPanInput(evt))
						_panEnabled = false;
					srcElement.releasePointerCapture(evt.pointerId);

				}

				// Update cache
				_previousPointer.copyFrom(_currentPointer);
				_previousTarget.copyFrom(_currentTarget);

			}

		}

		this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);

	}

	detachControl(element: HTMLElement) {
		if (this._observer && element) {
			this.camera.getScene().onPointerObservable.remove(this._observer);
			this._observer = null;
		}
	}

	checkInputs() {

	}
	checkPanInput(evt: PointerEvent) {
		return this.MOUSE_PAN.indexOf(evt.button) > -1;
	}


}
