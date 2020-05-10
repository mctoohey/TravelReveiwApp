DROP VIEW IF EXISTS ModeCostRating;
DROP VIEW IF EXISTS VenueCostRatingMaxOccurs;
DROP VIEW IF EXISTS VenueCostRatingOccurs;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS VenuePhoto;
DROP TABLE IF EXISTS Venue;
DROP TABLE IF EXISTS VenueCategory;
DROP TABLE IF EXISTS User;

CREATE TABLE User
  (
     user_id                INTEGER PRIMARY KEY NOT NULL,
     username               VARCHAR(64) NOT NULL,
     email                  VARCHAR(128) NOT NULL,
     given_name             VARCHAR(128) NOT NULL,
     family_name            VARCHAR(128) NOT NULL,
     password               VARCHAR(256) NOT NULL,
     auth_token             VARCHAR(32),
     profile_photo_filename VARCHAR(128),
     UNIQUE (username),
     UNIQUE (email),
     UNIQUE (auth_token)
  );

CREATE TABLE VenueCategory
  (
     category_id          INTEGER PRIMARY KEY NOT NULL,
     category_name        VARCHAR(64) NOT NULL,
     category_description VARCHAR(128) NOT NULL
  );

CREATE TABLE Venue
  (
     venue_id          INTEGER PRIMARY KEY NOT NULL,
     admin_id          INT NOT NULL,
     category_id       INT NOT NULL,
     venue_name        VARCHAR(64) NOT NULL,
     city              VARCHAR(128) NOT NULL,
     short_description VARCHAR(128) NOT NULL,
     long_description  VARCHAR(2048) NOT NULL,
     date_added        DATE NOT NULL,
     address           VARCHAR(256) NOT NULL,
     latitude          DOUBLE NOT NULL,
     longitude         DOUBLE NOT NULL,
     FOREIGN KEY (admin_id) REFERENCES User (user_id),
     FOREIGN KEY (category_id) REFERENCES VenueCategory (category_id)
  );

CREATE TABLE VenuePhoto
  (
     venue_id          INT NOT NULL,
     photo_filename    VARCHAR(128) NOT NULL,
     photo_description VARCHAR(128),
     is_primary        BOOLEAN NOT NULL DEFAULT false,
     PRIMARY KEY (venue_id, photo_filename),
     FOREIGN KEY (venue_id) REFERENCES Venue (venue_id)
  );

CREATE TABLE Review
  (
     review_id         INTEGER PRIMARY KEY NOT NULL,
     reviewed_venue_id INT NOT NULL,
     review_author_id  INT NOT NULL,
     review_body       VARCHAR(1024) NOT NULL,
     star_rating       TINYINT NOT NULL,
     cost_rating       TINYINT NOT NULL,
     time_posted       DATETIME NOT NULL,
     FOREIGN KEY (reviewed_venue_id) REFERENCES Venue (venue_id),
     FOREIGN KEY (review_author_id) REFERENCES User (user_id)
  );

