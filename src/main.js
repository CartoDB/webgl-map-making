// Get a WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

async function init() {
    async function getVectorData() {
        // Instantiate Map on Maps API
        const mapConfig = {
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: 'SELECT * FROM ne_10m_populated_places_simple',
                    }
                }
            ]
        };
        const response = await fetch('https://dmanzanares.carto.com/api/v1/map?api_key=default_public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapConfig),
        });
        const layergroup = await response.json();

        // Get the 0/0/0 MVT
        const tileURL = layergroup.metadata.tilejson.vector.tiles[0].replace('{x}', 0).replace('{y}', 0).replace('{z}', 0);
        await fetch(tileURL)
            .then(rawData => rawData.arrayBuffer())
            .then(response => {
                console.log(response);
            });
    }
    getVectorData();

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
    const program = createProgram(
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

    // Upload vector data to WebGL
    let geometry = [
        0, 0,
        0.45, 0.9,
        0.9, 0
    ];
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);

    function render() {
        // Set the WebGL Framebuffer resolution to the size of the canvas
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Clear the screen
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use our geometry for rendering now
        const vertexAttribute = gl.getAttribLocation(program, 'vertexPosition');
        gl.enableVertexAttribArray(vertexAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 0, 0);
        // Use our shader
        gl.useProgram(program);
        // Render!
        gl.drawArrays(gl.POINTS, 0, geometry.length / 2);
    }
    render();
}

init();
