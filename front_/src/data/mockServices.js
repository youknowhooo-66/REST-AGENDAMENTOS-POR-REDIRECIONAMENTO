const mockServices = [
    {
        id: 'service-1',
        title: 'Consulta Médica Geral',
        description: 'Agende uma consulta com um de nossos clínicos gerais para check-ups, diagnósticos e acompanhamento de saúde.',
        photo: 'https://images.unsplash.com/photo-1584516150909-df3492103c5b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        schedule: [
            {
                day: 'monday',
                slots: [
                    { time: '09:00', capacity: 2, available: 2 },
                    { time: '10:00', capacity: 1, available: 1 },
                    { time: '11:00', capacity: 2, available: 1 },
                ]
            },
            {
                day: 'wednesday',
                slots: [
                    { time: '14:00', capacity: 3, available: 3 },
                    { time: '15:00', capacity: 2, available: 2 },
                ]
            },
            {
                day: 'friday',
                slots: [
                    { time: '09:00', capacity: 1, available: 1 },
                    { time: '10:00', capacity: 1, available: 0 },
                ]
            },
        ]
    },
    {
        id: 'service-2',
        title: 'Exame de Rotina',
        description: 'Realize seus exames de sangue e urina anuais para monitorar sua saúde e prevenir doenças.',
        photo: 'https://images.unsplash.com/photo-1532938911079-bffdd87318f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        schedule: [
            {
                day: 'tuesday',
                slots: [
                    { time: '08:00', capacity: 5, available: 5 },
                    { time: '09:00', capacity: 5, available: 4 },
                ]
            },
            {
                day: 'thursday',
                slots: [
                    { time: '10:00', capacity: 4, available: 4 },
                    { time: '11:00', capacity: 3, available: 3 },
                ]
            },
        ]
    },
    {
        id: 'service-3',
        title: 'Aconselhamento Nutricional',
        description: 'Receba orientação personalizada de nossos nutricionistas para uma dieta saudável e equilibrada.',
        photo: 'https://images.unsplash.com/photo-1512621776951-a573b353845f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        schedule: [
            {
                day: 'monday',
                slots: [
                    { time: '13:00', capacity: 1, available: 1 },
                    { time: '14:00', capacity: 1, available: 1 },
                ]
            },
            {
                day: 'friday',
                slots: [
                    { time: '14:00', capacity: 2, available: 2 },
                    { time: '15:00', capacity: 2, available: 1 },
                ]
            },
        ]
    },
];

export default mockServices;
