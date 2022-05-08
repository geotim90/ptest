import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {Button, Card, LinearProgress, Paper, Stack, Typography} from '@mui/material';
import {useState} from 'react';
import {reorder, shuffle} from './util';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const i18n = require('./i18n.json');
const order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const end = 10;

function getPoints(options, key) {
    return 4 - options.findIndex(([k, v]) => k === key);
}

function App() {
    const [language, setLanguage] = useState('en');
    const [index, setIndex] = useState(0);
    const [options, setOptions] = useState(shuffle(Object.entries(i18n['en'].items[order[0]])));
    const [score, setScore] = useState({r: 0, y: 0, g: 0, b: 0});

    const toggleLanguage = () => {
        let newLanguage = 'en';
        if (language === 'en') {
            newLanguage = 'de';
        }
        setLanguage(newLanguage);
        // translate shuffled values without changing their position
        const optionsTranslation = i18n[newLanguage].items[order[index + 1]];
        setOptions(options.map(([k, v]) => [k, optionsTranslation[k]]));
    };

    const onDragEnd = (result) => {
        if (result.destination) {
            setOptions(reorder(
                options,
                result.source.index,
                result.destination.index
            ));
        }
    };

    const onNextClicked = () => {
        setScore({
            r: score.r + getPoints(options, 'r'),
            y: score.y + getPoints(options, 'y'),
            g: score.g + getPoints(options, 'g'),
            b: score.b + getPoints(options, 'b')
        });
        if (index + 1 < end) {
            setOptions(shuffle(Object.entries(i18n[language].items[order[index + 1]])));
        }
        setIndex(index + 1);
    };

    return (
        <Stack spacing={2}>
            {index < end ? <>
                <Button onClick={toggleLanguage}>
                    <img src="./gb.svg" alt="English" style={{height: '1rem'}}/>
                    &nbsp;&harr;&nbsp;
                    <img src="./de.svg" alt="Deutsch" style={{height: '1rem'}}/>
                </Button>
                <Paper sx={{p: 2, textAlign: 'center'}}>
                    <Typography>{i18n[language].prompt}</Typography>
                </Paper>
                <LinearProgress variant="determinate" value={index * 10}/>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <Stack spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                                {options.map(([k, v], i) => (
                                    <Draggable key={k} draggableId={k} index={i}>
                                        {(provided) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{p: 2, textAlign: 'center'}}
                                            >
                                                <Typography>{v}</Typography>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Stack>
                        )}
                    </Droppable>
                </DragDropContext>
                <Button variant="contained" onClick={onNextClicked} sx={{p: 2}}>Next</Button>
            </> : <>
                <HighchartsReact highcharts={Highcharts} options={{
                    chart: {
                        type: 'pie'
                    },
                    title: {
                        floating: true,
                        text: ''
                    },
                    subtitle: {
                        text: 'Minimum possible score: 10, Maximum possible score: 40, Total score: 100'
                    },
                    tooltip: {
                        pointFormat: '{point.y:.0f}'
                    },
                    accessibility: {
                        enabled: false,
                        point: {
                            valueSuffix: '%'
                        }
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '{point.y:.0f}'
                            }
                        }
                    },
                    series: [{
                        name: 'Result',
                        data: [
                            {name: 'Otter', color: 'yellow', y: score.y},
                            {name: 'Golden Retriever', color: 'green', y: score.g},
                            {name: 'Beaver', color: 'blue', y: score.b},
                            {name: 'Lion', color: 'red', y: score.r}
                        ]
                    }]
                }}/>
            </>}
        </Stack>
    );
}

export default App;
