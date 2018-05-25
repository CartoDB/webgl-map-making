// Get a WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

async function init() {
    // Compile our shader
    function createProgram(vertexShaderGLSL, fragmentShaderGLSL) {
        const program = gl.createProgram();
        gl.attachShader(program, compileShader(vertexShaderGLSL, gl.VERTEX_SHADER));
        gl.attachShader(program, compileShader(fragmentShaderGLSL, gl.FRAGMENT_SHADER));
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw gl.getProgramInfoLog(program);
        }
        return program;
    }
    function compileShader(glsl, shaderType) {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, glsl);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            throw gl.getShaderInfoLog(shader);
        }
        return shader;
    }
    createProgram(
        `
    // Vertex Shader
    precision highp float;

    attribute vec2 vertexPosition;

    void main(){
        // Z value fixed since we don't care about the visibility problem, see https://en.wikipedia.org/wiki/Z-buffering
        // W value fixed since we don't use 3D perspective, see https://www.tomdalling.com/blog/modern-opengl/explaining-homogenous-coordinates-and-projective-geometry/
        gl_Position = vec4(vertexPosition, 0.5, 1.);
        gl_PointSize = 10.;
    }
    `,

        `
    //Fragment Shader
    precision highp float;

    void main(){
        gl_FragColor = vec4(1.,1.,1.,1.);
    }
    `
    );

    function render() {
        // Clear the screen
        gl.clearColor(0.2, 0.8, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    render();
}

init();
