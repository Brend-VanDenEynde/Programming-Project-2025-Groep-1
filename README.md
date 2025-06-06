# EHB – Career Launch

## Ontwikkeld door Groep 1

## Technische Stack

- **Frontend:** Vite 
- **Backend:** Node.js met Express.js (draait op poort 3001)
- **Database:** MySQL

## Functionaliteiten



## Installatie

### Dependencies

Zorg dat de volgende software is geïnstalleerd:

- Node.js (v18+ aanbevolen)
- MySQL Server
- NPM
- Git

### Stap 1: Repository klonen

```bash
git clone https://github.com/Brend-VanDenEynde/Programming-Project-2025-Groep-1.git
cd ehbo-careerlaunch
```

### Stap 2: Database configureren

1. Importeer eerst `new_database.sql` in phpMyAdmin.
2. Importeer vervolgens het bijgevoegde `tabellen.sql`-bestand in de database.
3. Hoe de `.env` eruit moet zien, kun je terugvinden in de teamkanalen. De `.env` moet in de map van de API staan.


### Stap 3: De API starten

```bash
cd api
npm install cors
npm start
```

### Stap 4: Frontend starten

```bash
cd career-launch
npm install
npm run dev
```



