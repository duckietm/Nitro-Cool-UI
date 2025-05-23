import { ColorConverter, NitroFilter } from '@nitrots/nitro-renderer';

const vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;
void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}`;

const fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec3 lineColor;
uniform vec3 color;
uniform float time; // Added time uniform for animation
void main(void) {
    vec4 currentColor = texture2D(uSampler, vTextureCoord);
    vec3 colorLine = lineColor * currentColor.a;
    vec3 colorOverlay = color * currentColor.a;

    // Calculate fading factor using sine wave (oscillates between 0.5 and 1.0)
    float fadeFactor = 0.75 + 0.25 * sin(time * 3.0); // Adjust speed with multiplier

    if(currentColor.r == 0.0 && currentColor.g == 0.0 && currentColor.b == 0.0 && currentColor.a > 0.0) {
        gl_FragColor = vec4(colorLine.r * fadeFactor, colorLine.g * fadeFactor, colorLine.b * fadeFactor, currentColor.a);
    } else if(currentColor.a > 0.0) {
        gl_FragColor = vec4(colorOverlay.r * fadeFactor, colorOverlay.g * fadeFactor, colorOverlay.b * fadeFactor, currentColor.a * 0.35);
    }
}`;

export class ChooserSelectionFilter extends NitroFilter
{
    private _lineColor: number;
    private _color: number;
    private _time: number;

    constructor(lineColor: number | number[] = [0.700, 0.880, 0.950], color: number | number[] = [0.290, 0.350, 0.390])
    {
        super(vertex, fragment);

        this.uniforms.lineColor = new Float32Array(3);
        this.uniforms.color = new Float32Array(3);
        this.uniforms.time = 0.0; // Initialize time uniform
        this._time = 0.0;
        this.lineColor = lineColor;
        this.color = color;
    }

    public get lineColor(): number | number[]
    {
        return this._lineColor;
    }

    public set lineColor(value: number | number[])
    {
        const arr = this.uniforms.lineColor;

        if(typeof value === 'number')
        {
            ColorConverter.hex2rgb(value, arr);
            this._lineColor = value;
        }
        else
        {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];

            this._lineColor = ColorConverter.rgb2hex(arr);
        }
    }

    public get color(): number | number[]
    {
        return this._color;
    }

    public set color(value: number | number[])
    {
        const arr = this.uniforms.color;

        if(typeof value === 'number')
        {
            ColorConverter.hex2rgb(value, arr);
            this._color = value;
        }
        else
        {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];

            this._color = ColorConverter.rgb2hex(arr);
        }
    }

    public get time(): number
    {
        return this._time;
    }

    public set time(value: number)
    {
        this._time = value;
        this.uniforms.time = value;
    }
}