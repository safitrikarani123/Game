
        document.addEventListener('DOMContentLoaded', () => {
            // DOM Element References
            const mainMenu = document.getElementById('mainMenu');
            const gameArea = document.getElementById('gameArea');
            const gameInstruction = document.getElementById('gameInstruction');
            const gameContent = document.getElementById('gameContent');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const progressBar = document.getElementById('progressBar');
            const feedbackModal = document.getElementById('feedbackModal');
            const feedbackTitle = document.getElementById('feedbackTitle');
            const feedbackMessage = document.getElementById('feedbackMessage');
            const mikoCharacterImage = document.querySelector('.character-image');

            // Game State
            let score = 0;
            let currentCategory = '';
            let currentQuestionIndex = 0;
            let questions = [];

            // Sound Effects (requires internet)
            const correctSound = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
            const incorrectSound = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
            const levelUpSound = new Audio('https://www.soundjay.com/misc/sounds/magic-chime-01.mp3');
            
            // --- Data Bank for Questions ---
            const gameData = {
                greetings: [
                    { question: "Pilih gambar untuk 'Selamat Pagi'", answer: "Selamat Pagi", options: ["Selamat Pagi", "Selamat Malam", "Selamat Siang"], type: "image-text" },
                    { question: "Gambar mana yang menunjukkan 'Sampai Jumpa'?", answer: "Sampai Jumpa", options: ["Terima Kasih", "Sampai Jumpa", "Maaf"], type: "image-text" },
                ],
                animals: [
                    { question: "Manakah gambar 'Kucing'?", answer: "kucing", options: ["kucing", "anjing", "burung"], type: "image-text" },
                    { question: "Suara hewan apakah ini?", answer: "sapi", options: ["kambing", "ayam", "sapi"], type: "audio-image", audio: "https://www.soundjay.com/animals/sounds/cow-moo-1.mp3" },
                    { question: "Pilih gambar 'Gajah'", answer: "gajah", options: ["harimau", "gajah", "monyet"], type: "image-text" },
                ],
                numbers: [
                    { question: "Pilih angka 'Lima'", answer: "5", options: ["3", "8", "5"], type: "text" },
                    { question: "Ada berapa apel pada gambar?", answer: "4", options: ["4", "6", "2"], type: "count-image", image: "apel" },
                    { question: "Pilih angka 'Sepuluh'", answer: "10", options: ["7", "10", "1"], type: "text" },
                ],
                shapes: [
                    { question: "Manakah bentuk 'Lingkaran'?", answer: "lingkaran", options: ["persegi", "lingkaran", "segitiga"], type: "shape" },
                    { question: "Benda mana yang paling 'Besar'?", answer: "besar", options: ["kecil", "sedang", "besar"], type: "size-comparison" },
                    { question: "Manakah bentuk 'Bintang'?", answer: "bintang", options: ["hati", "bulan", "bintang"], type: "shape" },
                ],
                things: [
                    { question: "Pilih gambar 'Buku'", answer: "buku", options: ["buku", "pensil", "meja"], type: "image-text" },
                    { question: "Manakah yang merupakan 'Kursi'?", answer: "kursi", options: ["lemari", "kursi", "lampu"], type: "image-text" },
                ],
                family: [
                    { question: "Pilih gambar 'Ibu'", answer: "ibu", options: ["ayah", "ibu", "anak"], type: "image-text" },
                    { question: "Manakah yang merupakan 'Kakek'?", answer: "kakek", options: ["nenek", "paman", "kakek"], type: "image-text" },
                ],
                fruits: [
                    { question: "Manakah buah 'Pisang'?", answer: "pisang", options: ["apel", "jeruk", "pisang"], type: "image-text" },
                    { question: "Pilih buah 'Anggur'", answer: "anggur", options: ["anggur", "mangga", "semangka"], type: "image-text" },
                ],
            };

            // --- Global Functions attached to window object ---
            window.startGame = (category) => {
                currentCategory = category;
                currentQuestionIndex = 0;
                score = 0;
                questions = shuffleArray([...gameData[category]]);
                
                mainMenu.classList.remove('active');
                gameArea.classList.add('active');
                mikoCharacterImage.style.display = 'none'; // Hide Miko during gameplay

                updateScore();
                loadQuestion();
            };

            window.goBackToMenu = () => {
                gameArea.classList.remove('active');
                mainMenu.classList.add('active');
                mikoCharacterImage.style.display = 'block'; // Show Miko again
            };

            window.closeFeedbackModal = () => {
                feedbackModal.classList.remove('active');
                if (currentQuestionIndex >= questions.length) {
                    // Category finished
                    goBackToMenu();
                } else {
                    loadQuestion();
                }
            };

            // --- Core Game Logic ---
            function loadQuestion() {
                if (currentQuestionIndex >= questions.length) {
                    showCompletionFeedback();
                    return;
                }

                const q = questions[currentQuestionIndex];
                gameInstruction.textContent = q.question;
                gameContent.innerHTML = ''; // Clear previous options

                // Shuffle options to make it random every time
                const shuffledOptions = shuffleArray([...q.options]);

                shuffledOptions.forEach(option => {
                    const item = document.createElement('div');
                    item.className = 'game-item animate-pop-in';
                    item.dataset.answer = option;

                    if (q.type === 'image-text' || q.type === 'audio-image' || q.type === 'count-image') {
                        const img = document.createElement('img');
                        // Use placeholder images. In a real project, replace with actual image paths.
                        img.src = `https://placehold.co/100x100/4FC3F7/FFFFFF?text=${option}`;
                        img.alt = option;
                        item.appendChild(img);
                        
                        const span = document.createElement('span');
                        span.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                        item.appendChild(span);
                    } else if (q.type === 'text') {
                        const span = document.createElement('span');
                        span.textContent = option;
                        span.style.fontSize = '2rem'; // Make numbers bigger
                        item.appendChild(span);
                    } else if (q.type === 'shape') {
                        const shapeContainer = document.createElement('div');
                        shapeContainer.style.width = '100px';
                        shapeContainer.style.height = '100px';
                        shapeContainer.innerHTML = getShapeSVG(option); // Use SVG for shapes
                        item.appendChild(shapeContainer);
                        const span = document.createElement('span');
                        span.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                        item.appendChild(span);
                    }
                    
                    item.addEventListener('click', () => checkAnswer(option));
                    gameContent.appendChild(item);
                });

                updateProgressBar();
            }
            
            function checkAnswer(selectedAnswer) {
                // Prevent multiple clicks
                const items = gameContent.querySelectorAll('.game-item');
                items.forEach(item => item.style.pointerEvents = 'none');

                const correctAnswer = questions[currentQuestionIndex].answer;
                const isCorrect = selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();
                
                setTimeout(() => {
                    showFeedback(isCorrect);
                    
                    if (isCorrect) {
                        score += 10;
                        correctSound.play();
                        updateScore();
                    } else {
                        incorrectSound.play();
                    }
                    
                    currentQuestionIndex++;
                }, 300); // Small delay before showing feedback
            }

            function updateScore() {
                scoreDisplay.textContent = `Skor: ${score}`;
            }

            function updateProgressBar() {
                const progressPercentage = (currentQuestionIndex / questions.length) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }

            function showFeedback(isCorrect) {
                feedbackModal.classList.add('active');
                const content = feedbackModal.querySelector('.feedback-content');
                content.classList.remove('animate-scale-in');
                void content.offsetWidth; // Trigger reflow
                content.classList.add('animate-scale-in');

                if(isCorrect) {
                    feedbackTitle.textContent = 'Hebat!';
                    feedbackTitle.className = '';
                    feedbackMessage.textContent = 'Jawaban kamu benar!';
                } else {
                    feedbackTitle.textContent = 'Ayo Coba Lagi!';
                    feedbackTitle.className = 'incorrect';
                    const correctAnswer = questions[currentQuestionIndex].answer;
                    feedbackMessage.textContent = `Jawaban yang benar adalah ${correctAnswer}.`;
                }
            }

            function showCompletionFeedback() {
                levelUpSound.play();
                feedbackModal.classList.add('active');
                const content = feedbackModal.querySelector('.feedback-content');
                content.classList.remove('animate-scale-in');
                void content.offsetWidth; // Trigger reflow
                content.classList.add('animate-scale-in');
                
                feedbackTitle.textContent = 'Hore, Selesai!';
                feedbackTitle.className = '';
                feedbackMessage.textContent = `Kamu telah menyelesaikan kategori ini dengan skor ${score}!`;
                // Final progress bar update
                progressBar.style.width = `100%`;
            }

            // --- Helper Functions ---
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
                }
                return array;
            }
            
            function getShapeSVG(shapeName) {
                const colors = {
                    lingkaran: '#FF5722',
                    persegi: '#4CAF50',
                    segitiga: '#3F51B5',
                    bintang: '#FFC107',
                    hati: '#E91E63',
                    bulan: '#9E9E9E'
                };
                const color = colors[shapeName] || '#000';

                switch(shapeName) {
                    case 'lingkaran':
                        return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}" /></svg>`;
                    case 'persegi':
                        return `<svg viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="${color}" /></svg>`;
                    case 'segitiga':
                        return `<svg viewBox="0 0 100 100"><polygon points="50,5 95,95 5,95" fill="${color}" /></svg>`;
                    case 'bintang':
                        return `<svg viewBox="0 0 100 100"><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" fill="${color}"/></svg>`;
                    case 'hati':
                        return `<svg viewBox="0 0 100 100"><path d="M 50,30 C 10,0 40,0 50,30 C 60,0 90,0 50,30 C 50,30 90,60 50,95 C 10,60 50,30 50,30 Z" fill="${color}"/></svg>`;
                    case 'bulan':
                        return `<svg viewBox="0 0 100 100"><path d="M 50 95 A 45 45 0 1 1 50 5 C 70 30 70 70 50 95 Z" fill="${color}" /></svg>`;
                    default:
                        return '';
                }
            }
        });
    