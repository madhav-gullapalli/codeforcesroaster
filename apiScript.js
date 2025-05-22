async function getDatafromDeepSeek(msg) {
    const data1 = process.env.DEEPSEEKAPIKEY;
    const apiKey = data1.roast;
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: msg }]
        })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}
// This function fetches data from the given url using the Fetch API.
async function getDataFromApi(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
// This function generates a roast prompt based on the user's profile and performance.
function getPrompt(mainData, ratingData, statusData) {
   var prompt = "Roast this codeforces user based on their profile and performance: in a sarcastic yet condescending tone. \n";
   prompt += `User ${mainData.result[0].handle} has a rating of ${mainData.result[0].rating} as a ${mainData.result[0].rank}, and contribution of ${mainData.result[0].contribution}, with ${mainData.result[0].friendOfCount} friends and has solved ${statusData.result.length} problems. \n`;
   prompt += `Their contest performance: \n`;
   for (let i = 0; i < ratingData.result.length; i++) {
    const contestDate = new Date(ratingData.result[i].ratingUpdateTimeSeconds * 1000).toLocaleDateString();
    prompt += `Contest ${ratingData.result[i].contestId}: ${ratingData.result[i].newRating} (was ${ratingData.result[i].oldRating}) on ${contestDate}\n`;
   }
   prompt += `Their submissions (by rating): \n`;
   ratingDict = {};
   correctDict = {};
   for (let i = 0; i < statusData.result.length; i++) {
        if (statusData.result[i].problem.rating in ratingDict) {

           ratingDict[statusData.result[i].problem.rating] += 1;
        } else {
            ratingDict[statusData.result[i].problem.rating] = 1;
        }
        if (statusData.result[i].verdict == "OK") {
            if (statusData.result[i].problem.rating in correctDict) {
                correctDict[statusData.result[i].problem.rating] += 1;
            } else {
                correctDict[statusData.result[i].problem.rating] = 1;
            }
        }
   }
    for (const [key, value] of Object.entries(ratingDict)) {
         prompt += `Rating ${key}: ${value} submissions \n`;

    }
    prompt += `Their correct submissions (by rating): \n`;
    for (const [key, value] of Object.entries(correctDict)) {
         prompt += `Rating ${key}: ${value} correct submissions \n`;

    }
    ratingDict = {};
   correctDict = {};
   return prompt;
}
// This function fetches user data from the Codeforces API and generates a roast.
async function roastAndShowUser() {
    document.getElementById("roast").innerText = "";
    const handle = document.getElementById("handle").value;

    const apiUrlMain = `https://codeforces.com/api/user.info?handles=${handle}`;
    const apiUrlRating = `https://codeforces.com/api/user.rating?handle=${handle}`;
    const apiUrlStatus = `https://codeforces.com/api/user.status?handle=${handle}`;

    try {
        // Fetch all data in parallel
        const [userData, ratingData, statusData] = await Promise.all([
            getDataFromApi(apiUrlMain),
            getDataFromApi(apiUrlRating),
            getDataFromApi(apiUrlStatus)
        ]);

        // Generate the roast
        const roast = getPrompt(userData, ratingData, statusData);

        // Show the roast
        console.log(roast);
        getDatafromDeepSeek(roast).then((roast) => {
            var roastData = data.roast;
            //delete all * and # characters from data.roast
            roastData = roastData.replace(/[\*#]/g, '');
            document.getElementById("roast").innerText = roastData;
        });
        
        


    } catch (error) {
        console.log("Error: ", error);
        document.getElementById("roast").innerText = `${handle} is non-existent`;
    }
}