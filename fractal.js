
        const canvas = document.getElementById('fractal');
        const ctx = canvas.getContext('2d');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetBtn = document.getElementById('reset');
        const fractalTypeSelect = document.getElementById('fractal-type');
        
        let width, height;
        let xMin, xMax, yMin, yMax;
        let maxIterations = 1000;
        let fractalType = 'mandelbrot';
        let juliaConstant = { x: -0.4, y: 0.6 };

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            reset();
        }

        function reset() {
            xMin = -2;
            xMax = 2;
            yMin = -2;
            yMax = 2;
            if (fractalType === 'mandelbox') {
                xMin = -4;
                xMax = 4;
                yMin = -4;
                yMax = 4;
            }
            draw();
        }

        function draw() {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const cx = xMin + (x / width) * (xMax - xMin);
                    const cy = yMin + (y / height) * (yMax - yMin);
                    const color = fractalColor(cx, cy);
                    const index = (y * width + x) * 4;
                    data[index] = color[0];
                    data[index + 1] = color[1];
                    data[index + 2] = color[2];
                    data[index + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }
         
        function fractalColor(cx, cy) {
            let iteration;
            switch (fractalType) {
                case 'mandelbrot':
                    iteration = mandelbrot(cx, cy);
                    break;
                case 'julia':
                    iteration = julia(cx, cy);
                    break;
                case 'burningship':
                    iteration = burningShip(cx, cy);
                    break;
                case 'mandelbox':
                    iteration = mandelbox(cx, cy);
                    break;
            }

            if (iteration === maxIterations) {
                return [0, 0, 0];
            } else {
                const hue = (iteration / maxIterations) * 360;
                return hslToRgb(hue, 100, 50);
            }
        }

        function mandelbrot(cx, cy) {
            let x = 0, y = 0;
            let iteration = 0;

            while (x*x + y*y < 4 && iteration < maxIterations) {
                const xTemp = x*x - y*y + cx;
                y = 2*x*y + cy;
                x = xTemp;
                iteration++;
            }

            return iteration;
        }

        function julia(cx, cy) {
            let x = cx, y = cy;
            let iteration = 0;

            while (x*x + y*y < 4 && iteration < maxIterations) {
                const xTemp = x*x - y*y + juliaConstant.x;
                y = 2*x*y + juliaConstant.y;
                x = xTemp;
                iteration++;
            }

            return iteration;
        }

        function burningShip(cx, cy) {
            let x = 0, y = 0;
            let iteration = 0;

            while (x*x + y*y < 4 && iteration < maxIterations) {
                const xTemp = x*x - y*y + cx;
                y = Math.abs(2*x*y) + cy;
                x = xTemp;
                iteration++;
            }

            return iteration;
        }

        function mandelbox(cx, cy) {
            let x = cx, y = cy, z = 0;
            let iteration = 0;
            const scale = 2;

            while (x*x + y*y + z*z < 4 && iteration < maxIterations) {
                x = boxFold(x * scale);
                y = boxFold(y * scale);
                z = boxFold(z * scale);

                const r = Math.sqrt(x*x + y*y + z*z);
                if (r < 0.5) {
                    x *= 4;
                    y *= 4;
                    z *= 4;
                } else if (r < 1) {
                    x /= r*r;
                    y /= r*r;
                    z /= r*r;
                }

                x = x * scale + cx;
                y = y * scale + cy;
                z = z * scale;

                iteration++;
            }

            return iteration;
        }

        function boxFold(x) {
            if (x > 1) return 2 - x;
            if (x < -1) return -2 - x;
            return x;
        }

        function hslToRgb(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            let r, g, b;

            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

        function zoom(factor, centerX, centerY) {
            const newWidth = (xMax - xMin) * factor;
            const newHeight = (yMax - yMin) * factor;
            xMin = centerX - newWidth / 2;
            xMax = centerX + newWidth / 2;
            yMin = centerY - newHeight / 2;
            yMax = centerY + newHeight / 2;
            draw();
        }

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = xMin + (x / width) * (xMax - xMin);
            const centerY = yMin + (y / height) * (yMax - yMin);
            zoom(0.5, centerX, centerY);
        });

        zoomOutBtn.addEventListener('click', () => zoom(2, (xMin + xMax) / 2, (yMin + yMax) / 2));
        resetBtn.addEventListener('click', reset);

        fractalTypeSelect.addEventListener('change', (event) => {
            fractalType = event.target.value;
            reset();
        });

        window.addEventListener('resize', resize);
        resize();
