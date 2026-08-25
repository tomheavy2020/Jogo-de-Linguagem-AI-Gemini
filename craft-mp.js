// ================= MATRIX CRAFT MULTIPLAYER =================
let craftWS = null;
let opponentMesh = null;

function showMultiplayer() {
    const modal = document.getElementById("mpModal");
    if(modal) modal.style.display = "flex";
}

function hideMultiplayer() {
    const modal = document.getElementById("mpModal");
    if(modal) modal.style.display = "none";
}

function createCraftRoom() {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    craftWS = new WebSocket(proto + "//" + window.location.host);

    craftWS.onopen = function() {
        craftWS.send(JSON.stringify({ type: "craft_create" }));
    };

    craftWS.onmessage = function(e) {
        const d = JSON.parse(e.data);

        if(d.type === "craft_created") {
            document.getElementById("craftRoomCode").style.display = "block";
            document.getElementById("craftRoomCode").textContent = d.roomId;
            document.getElementById("mpStatus").textContent = "Aguardando amigo...";
        }
        if(d.type === "craft_opponent_joined") {
            hideMultiplayer();
            createOpponentMesh();
        }
        if(d.type === "craft_position") {
            updateOpponentPosition(d);
        }
        if(d.type === "craft_place") {
            createBlock(d.x, d.y, d.z, 5);
            document.getElementById("blockCount").textContent = blockCount;
        }
        if(d.type === "craft_break") {
            const b = blocks.find(function(bl) {
                return Math.round(bl.position.x) === d.x &&
                       Math.round(bl.position.y) === d.y &&
                       Math.round(bl.position.z) === d.z;
            });
            if(b) {
                world.remove(b);
                blocks.splice(blocks.indexOf(b), 1);
                blockCount--;
                document.getElementById("blockCount").textContent = blockCount;
            }
        }
        if(d.type === "craft_opponent_left") {
            alert("Amigo saiu");
            location.reload();
        }
    };
}

function joinCraftRoom(code) {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    craftWS = new WebSocket(proto + "//" + window.location.host);

    craftWS.onopen = function() {
        craftWS.send(JSON.stringify({ type: "craft_join", roomId: code }));
    };

    craftWS.onmessage = function(e) {
        const d = JSON.parse(e.data);

        if(d.type === "craft_joined") {
            hideMultiplayer();
            createOpponentMesh();
        }
        if(d.type === "craft_position") {
            updateOpponentPosition(d);
        }
        if(d.type === "craft_place") {
            createBlock(d.x, d.y, d.z, 5);
        }
        if(d.type === "craft_break") {
            const b = blocks.find(function(bl) {
                return Math.round(bl.position.x) === d.x &&
                       Math.round(bl.position.y) === d.y &&
                       Math.round(bl.position.z) === d.z;
            });
            if(b) { world.remove(b); blocks.splice(blocks.indexOf(b), 1); }
        }
    };
}

function createOpponentMesh() {
    const geometry = new THREE.BoxGeometry(0.6, 1.8, 0.4);
    const material = new THREE.MeshLambertMaterial({ color: 0x00f0ff });
    opponentMesh = new THREE.Mesh(geometry, material);
    opponentMesh.position.set(5, 4, 5);
    scene.add(opponentMesh);
}

function updateOpponentPosition(d) {
    if(opponentMesh) {
        opponentMesh.position.set(d.x, d.y, d.z);
    }
}

setInterval(function() {
    if(craftWS && craftWS.readyState === 1) {
        craftWS.send(JSON.stringify({
            type: "craft_position",
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        }));
    }
}, 100);
