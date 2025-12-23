import request from "then-request";
import RubeFileLoader from "../js/libs/rubeFileLoader.js";
import B2Helper from "./utils/B2Helper.ts";
import LinkedList from "./utils/LinkedList.ts";

class B2Loader {
  elementsList: any;
  resourceLoadingIndex: number;
  nextCarPositionAvailable: number;
  worldFacade: any;
  rubeFileLoader: any;
  loaded: any;

  constructor(worldFacade: any) {
    this.elementsList = new LinkedList();
    this.resourceLoadingIndex = 0;
    this.nextCarPositionAvailable = 0;
    this.worldFacade = worldFacade;
    this.rubeFileLoader = new RubeFileLoader();
    this.loaded = {};
  }

  addElement(specs: any) {
    this.elementsList.add(specs.id, specs.data, specs.type);
    this.continueLoadingList(specs.onAddedAndPlaced);
  }

  continueLoadingList(onAddedAndPlaced?: any) {
    if (this.elementsList.size > 0) {
      const resourceNode = this.elementsList.firstNode;
      this.elementsList.removeFirst();
      console.log('Loading B2 element:', resourceNode.dataType, 'from', resourceNode.data.jsonPath);
      request('GET', resourceNode.data.jsonPath)
        .done((retrievedData: any) => {
          console.log('B2 element loaded:', resourceNode.dataType);
          const subWorldJson = retrievedData.getBody();
          this.loadRawJson(subWorldJson, resourceNode, onAddedAndPlaced);
          this.continueLoadingList();
        });
    }
  }

  loadRawJson(rawJson: any, resourceNode: any, onAddedAndPlaced: any) {
    const parsedJson = this.rubeFileLoader.preprocessRube(JSON.parse(rawJson));

    // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex in a custom property
    this.worldFacade.b2World = this.rubeFileLoader.loadWorldFromRUBE(parsedJson, this.worldFacade.b2World, this.resourceLoadingIndex);

    if (resourceNode.dataType === 'track') {
      this.loaded[resourceNode.id] = this.extractAndPlaceTrack();
    }
    else if (resourceNode.dataType === 'car') {
      this.loaded[resourceNode.id] = this.extractAndPlaceLastCarAdded();
      this.nextCarPositionAvailable += 1;
    }
    this.resourceLoadingIndex += 1;
    console.log('Calling onAddedAndPlaced for', resourceNode.dataType);
    onAddedAndPlaced.call(this, this.loaded[resourceNode.id]);
    console.log('onAddedAndPlaced finished for', resourceNode.dataType);
  }

  extractAndPlaceTrack() {
    const trackBodySet = {
      allBodies: this.rubeFileLoader.getBodies(this.worldFacade.b2World),
      startPositions: this.rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, 'start'),
      iaLine: this.rubeFileLoader.getBodiesByCustomProperty(this.worldFacade.b2World, "string", "category", "iaLine")[0]
    };

    // Positioning the b2Track elements
    for (let j = 0; j < trackBodySet.allBodies.length; j++) {
      const trackB2Body = trackBodySet.allBodies[j];
      const position = trackB2Body.GetPosition();
      trackB2Body.SetPosition(B2Helper.math.AddVV(B2Helper.ScreenCenterVector, position));
    }
    this.worldFacade.trackBodySet = trackBodySet;
    return trackBodySet;
  }

  extractAndPlaceLastCarAdded() {
    const carB2BodiesSet = {
      carBody: this.findElementInWorldByNameAndResourceIndex("car_body")[0],
      rearTires: this.findElementInWorldByNameAndResourceIndex("wheel_rear"),
      frontTires: this.findElementInWorldByNameAndResourceIndex("wheel_front"),
      directionJoints: this.findJointInWorld("direction")
    };

    // Positioning the carB2BodiesSet elements
    const initialAngle = -Math.PI / 2; // Point to the left (-90 degrees)
    const startPosition = this.worldFacade.trackBodySet.startPositions[this.nextCarPositionAvailable].GetPosition();
    carB2BodiesSet.carBody.SetPosition(startPosition);
    carB2BodiesSet.carBody.SetAngle(initialAngle);
    for (let i = 0; i < carB2BodiesSet.rearTires.length; i++) {
      carB2BodiesSet.rearTires[i].SetPosition(startPosition);
      carB2BodiesSet.rearTires[i].SetAngle(initialAngle);
    }
    for (let i = 0; i < carB2BodiesSet.frontTires.length; i++) {
      carB2BodiesSet.frontTires[i].SetPosition(startPosition);
      carB2BodiesSet.frontTires[i].SetAngle(initialAngle);
    }

    return carB2BodiesSet;
  }

  findElementInWorldByNameAndResourceIndex(bodyName: string) {
    const bodies = this.findInWorld(bodyName);
    return this.rubeFileLoader.filterElementsByCustomProperty(bodies, 'int', 'loadingIndex', this.resourceLoadingIndex);
  }

  findInWorld(name: string) {
    return this.rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, name);
  }

  findJointInWorld(name: string) {
    const jointsInWorld = this.rubeFileLoader.getNamedJoints(this.worldFacade.b2World, name);
    return this.rubeFileLoader.filterElementsByCustomProperty(jointsInWorld, 'int', 'loadingIndex', this.resourceLoadingIndex);
  }
}

export default B2Loader;
