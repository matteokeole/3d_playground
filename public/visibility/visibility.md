# Visibility rendering

Source: <http://filmicworlds.com/blog/visibility-buffer-rendering-with-material-graphs>

> *PrePass:* For the Forward and Deferred pass, PrePass writes only depth. However, for the Visibility pass, it also writes the visibility U32 including drawCallId and triangleId.

> *Material:* For the Deferred pass, this pass refers to the material rasterization pass. For Visibility, it refers to the time of the compute pass. And of course, for the Forward pass this is merged with the Lighting pass for one number.

> *Lighting:* In the Deferred case, this pass is a compute shader that reads the textures and writes the lighting. Visibility does a similar operation with buffers instead of textures.