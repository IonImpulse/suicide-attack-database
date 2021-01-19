const header_array = [
    {name:"Number Killed",type:"number",csv_name:"# killed"},
    {name:"Number Wounded",type:"number",csv_name:"# wounded"},
    {name:"Age",type:"number",csv_name:"age"},
    {name:"Assassination?",type:"boolean",csv_name:"assassination?"},
    {name:"Attacker Name",type:"string",csv_name:"attacker.name"},
    {name:"Birth Location",type:"string",csv_name:"birth.location"},
    {name:"Birth Year",type:"number",csv_name:"birth.year"},
    {name:"Campaign Name",type:"string",csv_name:"campaign.name"},
    {name:"Country",type:"string",csv_name:"country"},
    {name:"Day",type:"number",csv_name:"day"},
    {name:"Education",type:"string",csv_name:"education"},
    {name:"Gender",type:"string",csv_name:"gender"},
    {name:"Attack Location",type:"string",csv_name:"location"},
    {name:"Marital Status",type:"string",csv_name:"marital"},
    {name:"Month",type:"number",csv_name:"month"},
    {name:"Occupation",type:"string",csv_name:"occupation"},
    {name:"Religion",type:"string",csv_name:"religion"},
    {name:"Target Name",type:"string",csv_name:"target.name"},
    {name:"Target Type",type:"string",csv_name:"type"},
    {name:"Weapon",type:"string",csv_name:"weapon"},
    {name:"Year",type:"number",csv_name:"year"},
];

const to_display = [
    "Number Killed",
    "Number Wounded",
    "Age",
    "Assassination?",
    "Birth Location",
    "Birth Year",
    "Campaign Name",
    "Country",
    "Day",
    "Education",
    "Gender",
    "Marital Status",
    "Occupation",
    "Religion",
    "Target Type",
    "Weapon",
    "Year",
]

async function load_data() {
    return new Promise((resolve, reject) => {
        Papa.parse("https://raw.githubusercontent.com/IonImpulse/suicide-attack-database/main/data/suicide_attacks.csv", {
            download: true,
            dynamicTyping: true,
            worker: true,
            header: true,
            complete (results, file) {
                resolve(results.data)
            },
            error (err, file) {
                reject(err)
            }
        });
    });
}

async function start() {
    console.log("Loading data...");

    const suicide_attack_data = await load_data();

    console.log("Loaded data!");

    return suicide_attack_data;
}


function createTable(array, header_array) {
    var content = `<table id="table-main" class="pure-table pure-table-horizontal">\n`;

    content += "<thead>\n<tr>";

    for (item of header_array) {
        let type = "";
        if (item.type == "number") {
            type = `data-sort-method="number"`;
        }
        content += `<th ${type}>${item.name}</th>\n`;
    }

    content += "</tr>\n</thead>";


    content += "<tbody>";

    for (row of array) {
        content += "<tr>\n";
        
        for (attribute in row) {
            content += `<td>${row[attribute]}</td>\n`;
        }

        content += "</tr>\n";
    }

    content += "</tbody>\n</table>\n";
    return content;
}

function findMinMax(object_array, attr) {
    let min = Infinity;
    let max = 0;

    for (obj of object_array) {
        if (obj[attr] != -1) {
            if (obj[attr] > max) {
                max = obj[attr];
            }
            
            if (obj[attr] < min) {
                min = obj[attr];
            }
        }
    }

    return [min, max];
}

async function onLoad() {    
    const suicide_attack_data = await start();

    sessionStorage.setItem("suicide_attack_data", JSON.stringify(suicide_attack_data));

    console.log("Data saved!");

    console.log("Creating filter buttons...");

    let buttons_html = "";

    for (header of header_array) {
        if (to_display.includes(header.name)) {
            if (header.type == "number") {
                let min_max = findMinMax(suicide_attack_data, header.csv_name);
    
                buttons_html += `\
                <div class="filter-box" id="${header.name.replace(" ", "-")}">
                    <b>${header.name}</b><br>Between
                    <input type="number" id="filter_${header.name.replace(" ", "-")}_lower" min="${min_max[0]}" max="${min_max[1]}"> and <input type="number" id="filter_${header.name.replace(" ", "-")}_upper" min="${min_max[0]}" max="${min_max[1]}">
                </div>
                `;
    
            } else if (header.type == "string") {
    
                buttons_html += `<div class="filter-box filter-checkbox" id="${header.name.replace(" ", "-")}">`;
    
                let options_list = [];
                
                for (obj of suicide_attack_data) {
                    if (!(options_list.includes(obj[header.csv_name])) && obj[header.csv_name] != undefined) {
                        options_list.push(obj[header.csv_name]);
                    }
                }
    
                options_list.sort();
    
                for (option of options_list) {
                    console.log(option);
                    buttons_html += `
                    <div class="filter-checkbox-item">
                        ${option}
                        <input type="checkbox" value="${option}">
                    </div>`
                    ;
                }
    
                buttons_html += "</div>";
            } 
        }
        
    }

    document.getElementById("filter-holder").innerHTML = buttons_html;
    
    //showTable(suicide_attack_data, header_array);
    
}

function processSortRequest() {

    const suicide_attack_data = JSON.parse(sessionStorage.getItem("suicide_attack_data"));
}

function showTable(suicide_attack_data, header_array) {
    document.getElementById("table-holder").innerHTML = createTable(suicide_attack_data, header_array);

    new Tablesort(document.getElementById("table-main"), {
        decending: true
    });
}

onLoad();