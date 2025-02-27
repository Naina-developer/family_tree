
async function fetchMembers() {
    let response = await fetch('http://127.0.0.1:5000/get_members');
    let members = await response.json();

    let parentSelect = document.getElementById('parent');
    parentSelect.innerHTML = '<option value="">No Parent (Root)</option>'; 

    members.forEach(member => {
        let option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        parentSelect.appendChild(option);
    });

    visualizeTree(members); 
}


document.getElementById('familyForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    let name = document.getElementById('name').value;
    let parent_id = document.getElementById('parent').value || null;

    let response = await fetch('http://127.0.0.1:5000/add_member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parent_id })
    });

    let data = await response.json();
    alert(data.message);
    fetchMembers(); 
});

function visualizeTree(members) {
    document.getElementById('treeContainer').innerHTML = ""; 

    let root = { id: null, children: [] };
    let memberMap = {};

    members.forEach(m => memberMap[m.id] = { ...m, children: [] });
    members.forEach(m => {
        if (m.parent_id) {
            memberMap[m.parent_id].children.push(memberMap[m.id]);
        } else {
            root.children.push(memberMap[m.id]);
        }
    });

    let width = 800, height = 600;
    let svg = d3.select("#treeContainer").append("svg")
        .attr("width", width)
        .attr("height", height);

    let treeLayout = d3.tree().size([width - 100, height - 100]);
    let hierarchy = d3.hierarchy(root, d => d.children);
    let treeData = treeLayout(hierarchy);

    let g = svg.append("g").attr("transform", "translate(50,50)");

    
    g.selectAll(".link")
        .data(treeData.links())
        .enter()
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "black");

   
    let nodes = g.selectAll(".node")
        .data(treeData.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
        .attr("r", 20)
        .attr("fill", "lightblue");

    nodes.append("text")
        .attr("dy", -30)
        .attr("text-anchor", "middle")
        .text(d => d.data.name);
}


document.getElementById('exportImage').addEventListener('click', async () => {
    let tree = document.getElementById('treeContainer');
    let canvas = await html2canvas(tree);
    let link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'family_tree.png';
    link.click();
});


document.getElementById('exportPDF').addEventListener('click', async () => {
    let tree = document.getElementById('treeContainer');
    let canvas = await html2canvas(tree);
    let pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL(), 'PNG', 10, 10);
    pdf.save('family_tree.pdf');
});


fetchMembers();
