CREATE DATABASE bachelor;

CREATE EXTENSION postgis;

CREATE TABLE sources(
    id VARCHAR(10) PRIMARY KEY UNIQUE NOT NULL,
    type VARCHAR(50),
    name VARCHAR(50) NOT NULL,
    shortName VARCHAR(50),
    country VARCHAR(50) NOT NULL,
    countryCode VARCHAR(50),
    long VARCHAR(50) NOT NULL,
    lat VARCHAR(50) NOT NULL,
    geog geography(point) NOT NULL,
    valid_from TIMESTAMP,
    county VARCHAR(50) NOT NULL,
    countyId INT NOT NULL,
    municipality VARCHAR(50) NOT NULL,
    municipalityId INT NOT NULL
);

CREATE TABLE inntekt_data(
   /* id INT PRIMARY KEY NOT NULL, */
   regionid INT NOT NULL,
   region VARCHAR(50) NOT NULL,
   husholdningstype VARCHAR(100),
   tid int,
   inntekt int,
   antallhus int
);
CREATE TABLE weather(
    weather_id BIGSERIAL UNIQUE PRIMARY KEY NOT NULL,
    source_id VARCHAR(10) NOT NULL,
    valid_from TIMESTAMP,
    element VARCHAR(50),
    CONSTRAINT fk_source
            FOREIGN KEY(source_id) 
            REFERENCES sources(id)
            ON DELETE CASCADE 
);
CREATE TABLE weather_data(
              parent_id INT, 
              element VARCHAR(50),
              time timestamp,
              value INT,
              CONSTRAINT fk_weather
            FOREIGN KEY(parent_id) 
            REFERENCES weather(weatherId)
            ON DELETE CASCADE );