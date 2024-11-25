document.addEventListener('DOMContentLoaded', () => {

    //modifiable area
    var Results_graph_title = '<h2>四型人才图表:</h2>';
    var Results_txt_title = '<h2>你的得分归类:</h2>';
    var score_range = [0, 1]
    var default_selection = 1
    
    var questions=[]
    var user_answers=[]

    var  giftsMapping = {}



    // Create the questions form
    const questions_filePath = 'questions.txt';
    const mapping_filePath = 'mapping.txt';
    loadQuestionsFromFile(questions_filePath);
    loadMappingFromFile(mapping_filePath);

    var answersArray = []

    console.log(answersArray)



    
    const scores = {};

    var debugging = [ false ];

    // Initialize scores object
    for (const gift in giftsMapping) {
        scores[gift] = 0;
    }

    const questionsContainer = document.getElementById('questions-container');
    const resultsContainer = document.getElementById('results-container');
    const surveyForm = document.getElementById('survey-form');


    function loadMappingFromFile(filePath) {

        // Load the gifts mapping from the mapping.txt file
            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    // Parse the text as JSON
                     giftsMapping = JSON.parse(data);
        
                    // Now you can use giftsMapping as needed
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        
        console.log(giftsMapping);

    }


    function loadQuestionsFromFile(filePath) {
	fetch(filePath)
	    .then(response => response.text())
	    .then(text => {
		const lines = text.split('\n');
		console.log(lines)
		questions = lines.map(line => line.trim()).filter(line => line.length > 0);

		// Now that we have the questions, we can create the questions form
		createQuestions(questions);

        answersArray = new Array(questions.length).fill(default_selection);
        
		initializeDefaultAnswers(questions); 
	    })
	    .catch(error => {
		console.error('Error fetching the questions text file:', error);
	    });
    }

    function createQuestions() {
        questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <label>${question}</label><br>
                ${score_range.map(number => `
                    <input type="radio" name="question${index}" value="${number}" class="survey-option" required>
                    <label>${number}</label>
                `).join('')}
            `;
	    questionsContainer.appendChild(questionItem);
	});

	const inputs = document.querySelectorAll('.survey-option');
	inputs.forEach(input => {
	    input.addEventListener('click', handleInputChange);
	});

    }

    function calculateScores() {
	// Reset scores
	for (const gift in giftsMapping) {
	    scores[gift] = 0;
	}

	if (debugging[0]){
	    user_answers.forEach((selectedOption, questionIndex) => {
		surveyForm[`question${questionIndex}`].value = selectedOption;

		for (const gift in giftsMapping) {
		    if (giftsMapping[gift].includes(questionIndex + 1)) {
			scores[gift] += parseInt(selectedOption, 10);
		    }
		}
	    });
	    return

	}

	// Calculate new scores
	questions.forEach((question, questionIndex) => {
	    const selectedOption = surveyForm[`question${questionIndex}`].value;
	    user_answers[questionIndex]=(parseInt(selectedOption, 10))
	    for (const gift in giftsMapping) {
		if (giftsMapping[gift].includes(questionIndex + 1)) {
		    scores[gift] += parseInt(selectedOption, 10);
		}
	    }
	});
    }



    function handleInputChange(event) {
	const questionItem = event.target.closest('.question-item');
	if (questionItem) {
	    questionItem.classList.add('user-modified');
	}
    }

    function displayResults_txt() {
	// Sort the gifts based on scores from highest to lowest
	const sortedGifts = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

	let resultsHTML = Results_txt_title;
	sortedGifts.forEach((gift) => {
	    // Start with the gift and its total score
	    resultsHTML += `<h3>${gift}: ${scores[gift]}</h3>`;

	    // Get the questions and scores for this gift, sorted by score
	    const giftQuestions = giftsMapping[gift]
	    .map(questionNumber => {
		const questionIndex = questionNumber - 1;
		const questionText = questions[questionIndex];
		const selectedOption = surveyForm[`question${questionIndex}`].value;
		return { text: questionText, score: parseInt(selectedOption, 10) };
	    })
	    .sort((a, b) => b.score - a.score); // Sort by score, descending

	    // Add each question and its score
	    giftQuestions.forEach(question => {
		resultsHTML += `<p>${question.text}<br>${question.score}</p>`;
	    });
	});

	resultsContainer.innerHTML += resultsHTML;
    }

    function displayResults_graph() {
    let resultsHTML = Results_graph_title
	// Sort the gifts based on scores from highest to lowest
	const sortedGifts = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

	// Set some dimensions and padding for the SVG
	const svgWidth = 600;
	const svgHeight = sortedGifts.length * 50 + 20; // 50px per bar + 20px padding
	const barHeight = 30;
	const padding = { top: 20, right: 20, bottom: 20, left: 150 }; // Increase left padding for text

	resultsHTML += `<svg width="${svgWidth}" height="${svgHeight}">`;

	sortedGifts.forEach((gift, index) => {
	    const barWidth = scores[gift] * 10; // Scale the bar width
	    const yPosition = index * 50 + padding.top; // 50px per bar

	    resultsHTML += `
		<rect width="${barWidth}" height="${barHeight}" x="${padding.left}" y="${yPosition}" style="fill:steelblue;" />
		<text x="${padding.left - 5}" y="${yPosition + barHeight / 2 + 5}" fill="black" text-anchor="end">${gift}</text>
		<text x="${barWidth + padding.left + 5}" y="${yPosition + barHeight / 2 + 5}" fill="black">${scores[gift]}</text>
		`;
	});

	resultsHTML += '</svg>';
	resultsContainer.innerHTML += resultsHTML;
    }

    // Function to initialize default answers to 3
    function initializeDefaultAnswers() {
    questions.forEach((question, questionIndex) => {
        surveyForm[`question${questionIndex}`].value = answersArray[questionIndex];
        user_answers.push(answersArray[questionIndex]);
        // input.classList.remove('user-modified');
    });


    }










    surveyForm.addEventListener('submit', (event) => {
	event.preventDefault();
	resultsContainer.innerHTML = '';
	calculateScores();
	displayResults_graph(); // This will display the bar chart
	displayResults_txt(); // This will display the text results with sorted scores
    
    const userAnswersString = user_answers.join('');
    document.getElementById('answerInput').value = userAnswersString;

    });




    window.debug = {
	questions: questions,
	giftsMapping: giftsMapping,
	scores: scores,
	debugging: debugging,
    };

    document.getElementById('submitAnswersButton').addEventListener('click', () => {
    
        const input = document.getElementById('answerInput').value;
        const newAnswers = Array.from(input).map(Number);
    
        for (let i = 0; i < newAnswers.length; i++) {
            answersArray[i] = newAnswers[i]; // Modify only the beginning elements
        }

        initializeDefaultAnswers()
    
    });


});






