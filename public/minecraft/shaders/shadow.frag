#version 300 es

precision mediump float;

in struct Output {
	vec4 position;
	vec4 lightSpacePosition;
	vec3 normal;
	vec2 uv;
} v_out;

uniform struct Camera {
	mat4 viewProjection;
	vec3 position;
} u_camera;
uniform struct Light {
	mat4 viewProjection;
	vec3 position;
} u_light;
uniform sampler2D u_depthSampler;
uniform sampler2D u_albedoSampler;

out vec4 FragColor;

const vec3 LIGHT_COLOR = vec3(1);
const vec3 SHADOW_COLOR = vec3(.1);
const vec3 AMBIENT = LIGHT_COLOR * .015;

float computeShadow(vec4 lightSpacePosition) {
	vec3 projectedPosition = lightSpacePosition.xyz / lightSpacePosition.w * .5 + .5;
	float closestDepth = texture(u_depthSampler, projectedPosition.xy).r;
	float currentDepth = projectedPosition.z;

	return float(currentDepth < closestDepth);
}

void main() {
	vec3 albedo = texture(u_albedoSampler, v_out.uv).rgb;
	vec3 normal = normalize(v_out.normal);

	vec3 lightDirection = normalize(u_light.position - v_out.position.xyz);
	float diffuseFactor = max(dot(lightDirection, normal), 0.);
	vec3 diffuse = diffuseFactor * LIGHT_COLOR;

	vec3 cameraDirection = normalize(u_camera.position - v_out.position.xyz);
	vec3 halfDirection = normalize(lightDirection + cameraDirection);
	float specularFactor = pow(max(dot(normal, halfDirection), 0.), 64.);
	vec3 specular = specularFactor * LIGHT_COLOR;

	float shadow = computeShadow(v_out.lightSpacePosition);

	vec3 color = (AMBIENT + (shadow + SHADOW_COLOR) * (diffuse + specular) * albedo);

	FragColor = vec4(color, 1);
}