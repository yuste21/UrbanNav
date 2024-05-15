// uris.js
const baseURI = 'http://localhost:8000/accidentes/';

export const URIsAccidentes = {
    //Chart
    chart_fecha_distrito: `${baseURI}/chart/fecha/distrito`,
    chart_hora_distrito: `${baseURI}/chart/hora/distrito`,
    chart_fecha_barrio: `${baseURI}/chart/fecha/barrio`,
    chart_hora_barrio: `${baseURI}/chart/hora/barrio`,

    //Individuales
    base: `${baseURI}`,
    zonas: `${baseURI}/zonas`,
    sexo: `${baseURI}/sexo`,
    alcohol: `${baseURI}/alcohol`,
    drogas: `${baseURI}/drogas`,
    lesion: `${baseURI}/lesion/gravedad`,
    vehiculo: `${baseURI}/vehiculo`,
    accidente: `${baseURI}/accidente`,
    clima: `${baseURI}/clima`,
    hora_concreta: `${baseURI}/hora/concreta`,
    fecha_concreta: `${baseURI}/fecha/concreta`,
    fecha_entre: `${baseURI}/fecha/entre`,
    hora_entre: `${baseURI}/hora/entre`,
    radio: `${baseURI}/radio`,
    zona_concreta: `${baseURI}/zona`,
    edad: `${baseURI}/edad`,

    //------------------------------Filtro con 2 atributos---------------------------//
    //Fecha Concreta+
    fechaConcreta_horaConcreta: `${baseURI}/fecha/concreta/hora/concreta`,
    fechaConcreta_entreHoras:   `${baseURI}/fecha/concreta/hora/entre`,
    fechaConcreta_edad:         `${baseURI}/fecha/concreta/edad`,
    fechaConcreta_vehiculo:     `${baseURI}/fecha/concreta/vehiculo`,
    fechaConcreta_drogas:       `${baseURI}/fecha/concreta/drogas`,
    fechaConcreta_alcohol:      `${baseURI}/fecha/concreta/alcohol`,
    fechaConcreta_lesion:       `${baseURI}/fecha/concreta/lesion`,
    fechaConcreta_sexo:         `${baseURI}/fecha/concreta/sexo`,
    fechaConcreta_accidente:    `${baseURI}/fecha/concreta/accidente`,
    fechaConcreta_clima:        `${baseURI}/fecha/concreta/clima`,
    fechaConcreta_radio:        `${baseURI}/fecha/concreta/radio`,

    //Entre Fechas+
    entreFechas_horaConcreta: `${baseURI}/fecha/entre/hora/concreta`,
    entreFechas_entreHoras:   `${baseURI}/fecha/entre/hora/entre`,
    entreFechas_edad:         `${baseURI}/fecha/entre/edad`,
    entreFechas_vehiculo:     `${baseURI}/fecha/entre/vehiculo`,
    entreFechas_drogas:       `${baseURI}/fecha/entre/drogas`,
    entreFechas_alcohol:      `${baseURI}/fecha/entre/alcohol`,
    entreFechas_lesion:       `${baseURI}/fecha/entre/lesion`,
    entreFechas_sexo:         `${baseURI}/fecha/entre/sexo`,
    entreFechas_accidente:    `${baseURI}/fecha/entre/accidente`,
    entreFechas_clima:        `${baseURI}/fecha/entre/clima`,
    entreFechas_radio:        `${baseURI}/fecha/entre/radio`,

    //Hora Concreta+
    horaConcreta_edad:      `${baseURI}/hora/concreta/edad`,
    horaConcreta_vehiculo:  `${baseURI}/hora/concreta/vehiculo`,
    horaConcreta_drogas:    `${baseURI}/hora/concreta/drogas`,
    horaConcreta_alcohol:   `${baseURI}/hora/concreta/alcohol`,
    horaConcreta_lesion:    `${baseURI}/hora/concreta/lesion`,
    horaConcreta_sexo:      `${baseURI}/hora/concreta/sexo`,
    horaConcreta_accidente: `${baseURI}/hora/concreta/accidente`,
    horaConcreta_clima:     `${baseURI}/hora/concreta/clima`,
    horaConcreta_radio:     `${baseURI}/hora/concreta/radio`,

    //Entre Horas+
    entreHoras_edad:      `${baseURI}/hora/entre/edad`,
    entreHoras_vehiculo:  `${baseURI}/hora/entre/vehiculo`,
    entreHoras_drogas:    `${baseURI}/hora/entre/drogas`,
    entreHoras_alcohol:   `${baseURI}/hora/entre/alcohol`,
    entreHoras_lesion:    `${baseURI}/hora/entre/lesion`,
    entreHoras_sexo:      `${baseURI}/hora/entre/sexo`,
    entreHoras_accidente: `${baseURI}/hora/entre/accidente`,
    entreHoras_clima:     `${baseURI}/hora/entre/clima`,
    entreHoras_radio:     `${baseURI}/hora/entre/radio`,

    //Edad+
    edad_vehiculo:      `${baseURI}/edad/vehiculo`,
    edad_drogas:        `${baseURI}/edad/drogas`,
    edad_alcohol:       `${baseURI}/edad/alcohol`,
    edad_lesion:        `${baseURI}/edad/lesion`,
    edad_sexo :         `${baseURI}/edad/sexo`,
    edad_accidente :    `${baseURI}/edad/accidente`,
    edad_clima :        `${baseURI}/edad/clima`,
    edad_radio :        `${baseURI}/edad/radio`,

    //Vehiculo+
    vehiculo_accidente: `${baseURI}/vehiculo/accidente`,
    vehiculo_alcohol:   `${baseURI}/vehiculo/alcohol`,
    vehiculo_clima:     `${baseURI}/vehiculo/clima`,
    vehiculo_drogas:    `${baseURI}/vehiculo/drogas`,
    vehiculo_lesion:    `${baseURI}/vehiculo/lesion`,
    vehiculo_radio:     `${baseURI}/vehiculo/radio`,
    vehiculo_sexo:  `${baseURI}/vehiculo/sexo`,

    //Drogas+
    drogas_accidente:   `${baseURI}/drogas/accidente`,
    drogas_alcohol:     `${baseURI}/drogas/alcohol`,
    drogas_clima:       `${baseURI}/drogas/clima`,
    drogas_lesion:      `${baseURI}/drogas/lesion`,
    drogas_radio:       `${baseURI}/drogas/radio`,
    drogas_sexo:        `${baseURI}/drogas/sexo`,

    //Alcohol+
    alcohol_accidente:  `${baseURI}/alcohol/accidente`,
    alcohol_clima:      `${baseURI}/alcohol/clima`,
    alcohol_lesion:     `${baseURI}/alcohol/lesion`,
    alcohol_radio:      `${baseURI}/alcohol/radio`,
    alcohol_sexo:       `${baseURI}/alcohol/sexo`,
    
    //Lesion+
    lesion_accidente: `${baseURI}/lesion/accidente`,
    lesion_clima: `${baseURI}/lesion/clima`,
    lesion_radio: `${baseURI}/lesion/radio`,
    lesion_sexo: `${baseURI}/lesion/sexo`,

    //Sexo+
    sexo_accidente: `${baseURI}/sexo/accidente`,
    sexo_clima: `${baseURI}/sexo/clima`,
    sexo_radio: `${baseURI}/sexo/radio`,

    //Accidente+
    accidente_clima: `${baseURI}/accidente/clima`,
    accidente_radio: `${baseURI}/accidente/radio`,

    //Clima+
    clima_radio: `${baseURI}/clima/radio`,

    //------------------------------Filtro con 3 atributos---------------------------//
    //Fecha Concreta + Hora Concreta +
    fechaConcreta_horaConcreta_accidente: `${baseURI}/fecha/concreta/hora/concreta/accidente`,
    fechaConcreta_horaConcreta_alcohol: `${baseURI}/fecha/concreta/hora/concreta/alcohol`,
    fechaConcreta_horaConcreta_clima: `${baseURI}/fecha/concreta/hora/concreta/clima`,
    fechaConcreta_horaConcreta_drogas: `${baseURI}/fecha/concreta/hora/concreta/drogas`,
    fechaConcreta_horaConcreta_edad: `${baseURI}/fecha/concreta/hora/concreta/edad`,
    fechaConcreta_horaConcreta_lesion: `${baseURI}/fecha/concreta/hora/concreta/lesion`,
    fechaConcreta_horaConcreta_radio: `${baseURI}/fecha/concreta/hora/concreta/radio`,
    fechaConcreta_horaConcreta_sexo: `${baseURI}/fecha/concreta/hora/concreta/sexo`,
    fechaConcreta_horaConcreta_vehiculo: `${baseURI}/fecha/concreta/hora/concreta/vehiculo`,

    //Fecha Concreta + Entre Horas +
    fechaConcreta_entreHoras_accidente: `${baseURI}/fecha/concreta/hora/entre/accidente`,
    fechaConcreta_entreHoras_alcohol: `${baseURI}/fecha/concreta/hora/entre/alcohol`,
    fechaConcreta_entreHoras_clima: `${baseURI}/fecha/concreta/hora/entre/clima`,
    fechaConcreta_entreHoras_drogas: `${baseURI}/fecha/concreta/hora/entre/drogas`,
    fechaConcreta_entreHoras_edad: `${baseURI}/fecha/concreta/hora/entre/edad`,
    fechaConcreta_entreHoras_lesion: `${baseURI}/fecha/concreta/hora/entre/lesion`,
    fechaConcreta_entreHoras_radio: `${baseURI}/fecha/concreta/hora/entre/radio`,
    fechaConcreta_entreHoras_sexo: `${baseURI}/fecha/concreta/hora/entre/sexo`,
    fechaConcreta_entreHoras_vehiculo: `${baseURI}/fecha/concreta/hora/entre/vehiculo`,

    //Entre Fechas + Hora Concreta +
    entreFechas_horaConcreta_accidente: `${baseURI}/fecha/entre/hora/concreta/accidente`,
    entreFechas_horaConcreta_alcohol: `${baseURI}/fecha/entre/hora/concreta/alcohol`,
    entreFechas_horaConcreta_clima: `${baseURI}/fecha/entre/hora/concreta/clima`,
    entreFechas_horaConcreta_drogas: `${baseURI}/fecha/entre/hora/concreta/drogas`,
    entreFechas_horaConcreta_edad: `${baseURI}/fecha/entre/hora/concreta/edad`,
    entreFechas_horaConcreta_lesion: `${baseURI}/fecha/entre/hora/concreta/lesion`,
    entreFechas_horaConcreta_radio: `${baseURI}/fecha/entre/hora/concreta/radio`,
    entreFechas_horaConcreta_sexo: `${baseURI}/fecha/entre/hora/concreta/sexo`,
    entreFechas_horaConcreta_vehiculo: `${baseURI}/fecha/entre/hora/concreta/vehiculo`,

    //Entre Fechas + Entre Horas +
    entreFechas_entreHoras_accidente: `${baseURI}/fecha/entre/hora/entre/accidente`,
    entreFechas_entreHoras_alcohol: `${baseURI}/fecha/entre/hora/entre/alcohol`,
    entreFechas_entreHoras_clima: `${baseURI}/fecha/entre/hora/entre/clima`,
    entreFechas_entreHoras_drogas: `${baseURI}/fecha/entre/hora/entre/drogas`,
    entreFechas_entreHoras_edad: `${baseURI}/fecha/entre/hora/entre/edad`,
    entreFechas_entreHoras_lesion: `${baseURI}/fecha/entre/hora/entre/lesion`,
    entreFechas_entreHoras_radio: `${baseURI}/fecha/entre/hora/entre/radio`,
    entreFechas_entreHoras_sexo: `${baseURI}/fecha/entre/hora/entre/sexo`,
    entreFechas_entreHoras_vehiculo: `${baseURI}/fecha/entre/hora/entre/vehiculo`
};
