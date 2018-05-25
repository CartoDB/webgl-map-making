// Get a WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

async function init() {
    function render() {
        // Clear the screen
        gl.clearColor(0.2, 0.8, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    render();
}

init();
