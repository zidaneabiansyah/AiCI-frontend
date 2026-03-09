Place your Blender-exported model here:

  /public/learning/radar/models/radar-assembly.glb

Node naming convention inside GLB:
  radar_step_01
  radar_step_02
  ...
  radar_step_22

Each node should already be in its final transform (position/rotation) in Blender.
At runtime, StepManager stores those final transforms, offsets parts upward, and animates each step into place.
