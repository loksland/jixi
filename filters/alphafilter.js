
// Source: https://github.com/pixijs/pixi.js/issues/4334
var frag = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uAlpha;

void main(void)
{
   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;
}
`;

var vert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

export default class AlphaFilter extends PIXI.Filter {
    constructor() { super(vert,frag); this.alpha = 1.0; }
    get alpha() { return this.uniforms.uAlpha; }
    set alpha(value) { this.uniforms.uAlpha = value; }
}