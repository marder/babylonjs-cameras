/// <reference types="babylonjs" />

var canvas = document.getElementById("scene");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

let camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 200, 0), scene, true);
camera.setTarget(BABYLON.Vector3.Zero());

scene.createDefaultLight();
createGrid();

// Add Camera inputs
let panInputs = new Marder.MousePanInputs();
camera.inputs.add(panInputs);
panInputs.attachControl(canvas);

engine.runRenderLoop(() => {
   scene.render();
});

window.addEventListener("resize", () => {
   engine.resize();
});

function createGrid() {

   let size = 300;

   let min = -size / 2;
   let max = size / 2;

   let addedCounter = 0;

   for (let x = min; x <= max; x += 50) {

      for (let y = min; y <= max; y += 50) {

         for (let z = min; z <= max; z += 50) {

            let box = BABYLON.MeshBuilder.CreateBox(`box:${x}:${z}`, {
               size: 20
            }, scene);

            box.position = new BABYLON.Vector3(x, y, z);

            let material = new BABYLON.StandardMaterial("material:" + box.name, scene);
            material.diffuseColor = BABYLON.Color3.Random();
            box.material = material;

            addedCounter++;

         }

      }

   }

   console.log(`${addedCounter} boxes added.`)

}