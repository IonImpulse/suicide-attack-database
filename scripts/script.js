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

    const flag_data = await load_data();

    console.log("Loaded data!");
    console.log(flag_data);
    return flag_data;
}

async function onLoad() {
    sessionStorage.setItem("flag_data", JSON.stringify(await start()));

}

onLoad();