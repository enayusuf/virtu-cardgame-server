const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: [
            "http://localhost:9000",
            "https://virtu-cardgame.vercel.app"
        ]
    }
});
let users = [];

const maxUsers = 3;
const questionsBank = [
    'What is your favorit color?',
    'What kind of animal that has tall neck?',
    'What kind of animal that has tall nouse?',
    'Who the most popular artist in the world?',
    'Who the most popular soccer player in the world?',
    'How many province in indonesia?',
    'What the most popular programming language?',
    'Who our first precident?',
    'Who our first women president?',
    'Who has the shortest period as a president?'
]

let questions = []
let drawedCards = []

function getQuestion(index, questions) {
    const currentQuestion = questionsBank[index]

    if (questions.indexOf(currentQuestion) === -1) {
        questions.push(currentQuestion)
    } else {
        return getQuestion(Math.floor(Math.random() * 10), questions)
    }

    return currentQuestion
}

io.on("connection", (socket) => {
    console.log('A user connected');

    socket.on('setUsername', function (data) {
        console.log(socket.id)
        console.log(users)
        if (users.indexOf(data) === -1) {
            users.push(data);
            socket.emit('userSet', data);
        } else {
            socket.emit('userExists', data + ' username is taken! Try some other username.');
        }

        io.sockets.emit('userListUpdated', users);

        let gameStartStatus = '';

        if (users.length === maxUsers) {
            gameStartStatus = 'started'
        } else {
            gameStartStatus = 'Waiting for Players <br/>' + users.length + '/' + maxUsers
        }


        questions[users.length - 1] = getQuestion(Math.floor(Math.random() * 10), questions)
        drawedCards[users.length - 1] = false

        console.log({ 'questions': questions, 'drawedCards': drawedCards })

        io.sockets.emit('gameStartStatus', gameStartStatus);
        io.sockets.emit('questionsAndDraw', { 'questions': questions, 'drawedCards': drawedCards });
    })

    socket.on('currentPlayerSet', function (data) {
        io.sockets.emit('currentPlayerIs', data);
    })

    socket.on('updateQuestionsAndDraw', function (data) {
        io.sockets.emit('questionsAndDraw', data);
    })

    socket.on('onFinish', function (data) {
        users = []
        io.sockets.emit('onFinish');
    })
});

io.listen(8080);