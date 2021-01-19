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
    let header_index = 0;

    for (header of header_array) {
        if (to_display.includes(header.name)) {
            if (header.type == "number") {
                let min_max = findMinMax(suicide_attack_data, header.csv_name);
    
                buttons_html += `\
                <div class="filter-box filter-number" id="header_${header_index}">
                    <b>${header.name}</b><br>Between
                    <input type="number" id="filter_${header_index}_lower" min="${min_max[0]}" max="${min_max[1]}"> and <input type="number" id="filter_${header_index}_upper" min="${min_max[0]}" max="${min_max[1]}">
                </div>
                `;
    
            } else if (header.type == "string") {
    
                buttons_html += `
                <div class="filter-box filter-checkbox" id="header_${header_index}">
                    <b>${header.name}</b>
                    
                `;
    
                let options_list = [];
                
                for (obj of suicide_attack_data) {
                    if (!(options_list.includes(obj[header.csv_name])) && obj[header.csv_name] != undefined) {
                        options_list.push(obj[header.csv_name]);
                    }
                }
    
                options_list.sort();
                
                let option_index = 0;

                for (option of options_list) {

                    buttons_html += `
                    <div class="filter-checkbox-item">
                        ${option}
                        <input type="checkbox" id="checkbox_${header_index}_${option_index}" value="${option}">
                    </div>`
                    ;
                    option_index++;
                }
    
                buttons_html += "</div>";
            } else if (header.type == "boolean") {
                buttons_html += `\
                <div class="filter-box filter-boolean" id="header_${header_index}">
                    <b>${header.name}</b><br>
                    <input type="checkbox">
                </div>
                `;
            }
        }

        header_index++;
        
    }

    document.getElementById("filter-holder").innerHTML = buttons_html;
    
    console.log("Created!");
    
}

function showTable(suicide_attack_data, header_array) {
    document.getElementById("button-holder").style.marginBottom = "10vh";
    document.getElementById("table-holder").style.marginBottom = "30vh";

    document.getElementById("table-holder").innerHTML = createTable(suicide_attack_data, header_array);

    new Tablesort(document.getElementById("table-main"), {
        decending: true
    });
}

function getPassingValues() {
    let number_filters = document.getElementsByClassName("filter-number");
    let checkbox_filters = document.getElementsByClassName("filter-checkbox");
    let boolean_filters = document.getElementsByClassName("filter-boolean");
    
    let passing_values = [];

    for (filter of number_filters) {
        let header_index = parseInt(filter.id.replace("header_",""));

        let lower_bound = document.getElementById(`filter_${header_index}_lower`).value;
        let upper_bound = document.getElementById(`filter_${header_index}_upper`).value;

        const test_number = obj[header_array[header_index].csv_name];
        
        if (lower_bound == "" && upper_bound == "") {
            passing_values.push({header_index:header_index,type:"pass"});
            
        } else {
            if (lower_bound == "") {
                lower_bound = -1;
            }

            if (upper_bound == "") {
                upper_bound = Infinity;
            }

            passing_values.push({header_index:header_index,type:"number",lower:parseInt(lower_bound),upper:parseInt(upper_bound)});
        }
    }

    for (filter of checkbox_filters) {
        let header_index = parseInt(filter.id.replace("header_",""));

        let temp_passing_values = [];

        for (child of filter.childNodes) {
            if (child.childNodes[1] != undefined) {
                if (child.childNodes[1].value != undefined && child.childNodes[1].value != "") {
                    let value = child.childNodes[1].value;
                    let checked = child.childNodes[1].checked;
                
                    if (checked === true) {
                        temp_passing_values.push(value);
                    }                    
                }
            }
        }

        if (temp_passing_values.length == 0) {
            passing_values.push({header_index:header_index,type:"pass"});
        } else {
            passing_values.push({header_index:header_index,type:"checkbox",pass_list:temp_passing_values});
        }
    }

    for (filter of boolean_filters) {
        let header_index = parseInt(filter.id.replace("header_",""));

        console.log(filter.childNodes[4]);

        if (filter.childNodes[4].checked == true) {
            passing_values.push({header_index:header_index,type:"boolean"});
        } else {
            passing_values.push({header_index:header_index,type:"pass"});
        }
    }
    return passing_values;
}

function submitFilters() {
    console.log("Filtering out data...");

    const suicide_attack_data = JSON.parse(sessionStorage.getItem("suicide_attack_data"));

    let filtered_suicide_attack_data = [];

    const passing_array = getPassingValues();

    console.log(passing_array);

    for (obj of suicide_attack_data) {
        let passed = true;

        for (value of passing_array) {
            if (value.type != "pass") {
                const to_test = obj[header_array[value.header_index].csv_name];
                
                if (value.type == "number") {
                    if (!(parseInt(to_test) >= value.lower && parseInt(to_test) <= value.upper)) {
                        passed = false;
                    }
                } else if (value.type == "checkbox") {
                    if (!(value.pass_list.includes(to_test))) {
                        passed = false;
                    }
                } else if (value.type == "boolean") {
                    if (to_test == "False") {
                        passed = false;
                    }
                }
            }
        }

        if (passed === true) {
            filtered_suicide_attack_data.push(obj);
        }
    }
    

    showTable(filtered_suicide_attack_data, header_array);
}

onLoad();