let chart; // global chart variable

window.onload = function() {

    const canvas = document.getElementById("tank");
    const ctx = canvas.getContext("2d");

    let fish = [];
    let predators = [];
    let generation = 0;
    let frame = 0;

    // Chart setup
    const chartCtx = document.getElementById("graph").getContext("2d");
    chart = new Chart(chartCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "% of Toxic Fish",
                data: [],
                borderWidth: 2,
                borderColor: "red",
                backgroundColor: "rgba(255,0,0,0.2)"
            }]
        },
        options: { scales: { y: { min:0, max:1 } } }
    });

    // Functions
    function moveFish(f){
    f.x += f.vx;
    f.y += f.vy;

    // Bounce off walls
    if(f.x < 5){ f.x = 5; f.vx *= -1; }
    if(f.x > 695){ f.x = 695; f.vx *= -1; }
    if(f.y < 5){ f.y = 5; f.vy *= -1; }
    if(f.y > 395){ f.y = 395; f.vy *= -1; }
}

function movePredator(p){
    let target = null, minDist = Infinity;
    fish.forEach(f=>{
        if(!f.alive) return;
        if(f.toxic) return; // predators avoid toxic
        let dx = f.x - p.x, dy = f.y - p.y, dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < minDist){ minDist = dist; target = f; }
    });

    if(target){
        let dx = target.x - p.x, dy = target.y - p.y, dist = Math.sqrt(dx*dx + dy*dy);
        // Move toward target
        p.x += dx/dist * p.speed;
        p.y += dy/dist * p.speed;

        // Eat target if close
        if(dist < 10) target.alive = false;
    }

    // Keep predator inside canvas
    if(p.x < 10) p.x = 10;
    if(p.x > 690) p.x = 690;
    if(p.y < 10) p.y = 10;
    if(p.y > 390) p.y = 390;
}

    function init(){
        fish = []; predators = [];
        generation = 0; frame=0;
        for(let i=0;i<50;i++) fish.push(createFish(Math.random()<0.5));
        for(let i=0;i<3;i++) predators.push(createPredator());
        chart.data.labels=[]; chart.data.datasets[0].data=[]; chart.update();
    }

    function moveFish(f){
        f.x+=f.vx; f.y+=f.vy;
        if(f.x<0||f.x>700) f.vx*=-1;
        if(f.y<0||f.y>400) f.vy*=-1;
    }

    function movePredator(p){
        let target=null,minDist=Infinity;
        fish.forEach(f=>{
            if(!f.alive) return;
            if(f.toxic) return; // avoid toxic
            let dx=f.x-p.x, dy=f.y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<minDist){ minDist=dist; target=f; }
        });
        if(target){
            let dx=target.x-p.x, dy=target.y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
            p.x += dx/dist*p.speed;
            p.y += dy/dist*p.speed;
            if(dist<10) target.alive=false;
        }
    }

    function draw(){
        ctx.clearRect(0,0,700,400);
        fish.forEach(f=>{
            if(!f.alive) return;
            ctx.fillStyle = f.toxic?"red":"blue";
            ctx.beginPath(); ctx.arc(f.x,f.y,5,0,Math.PI*2); ctx.fill();
        });
        predators.forEach(p=>{
            ctx.fillStyle="black";
            ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill();
        });
    }

    function updateGraph(){
        let alive=fish.filter(f=>f.alive);
        let toxic=alive.filter(f=>f.toxic).length/alive.length||0;
        chart.data.labels.push(generation);
        chart.data.datasets[0].data.push(toxic);
        chart.update();
        document.getElementById("stats").innerText=
            `Generation: ${generation}\nPopulation: ${alive.length}\n% of Toxic Fish: ${(toxic*100).toFixed(1)}%`;
    }

    function reproduce(){
        let alive=fish.filter(f=>f.alive);
        let newFish=[];
        alive.forEach(f=>{
            newFish.push(createFish(f.toxic));
            newFish.push(createFish(Math.random()<0.05? !f.toxic : f.toxic));
        });
        fish=newFish.slice(0,200);
    }

    function animate(){
        frame++;
        fish.forEach(moveFish);
        predators.forEach(movePredator);
        draw();
        if(frame%180===0){
            updateGraph();
            reproduce();
            generation++;
        }
        requestAnimationFrame(animate);
    }

    window.runSimulation = function(){
        init();
        animate();
    };

};
