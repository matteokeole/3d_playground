import {GLTFLoader} from "Loader";
import {SSD} from "SSD";

const gltfLoader = new GLTFLoader();
const gltf = await gltfLoader.load("model.gltf");

const ssd = SSD.fromGLTF(gltf);

GLTFLoader loader;
const GLTF& gltf = loader.load("model.gltf");