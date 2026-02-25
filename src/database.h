#pragma once
#include <iostream>
#include <pqxx/pqxx>
#include <mutex>
#include <nlohmann/json.hpp>

class Database {
private:
	std::unique_ptr<pqxx::connection> conn;
	std::mutex mtx;
public:
	
	Database() {
		std::ifstream file("config.json");
		if (!file.is_open()) {
			throw std::runtime_error("Config file not open");
		}
		nlohmann::json data = nlohmann::json::parse(file);
		auto database_config = data["database"];
		auto connection_string = "host=" + database_config["host"].get<std::string>() + " port=" + std::to_string(database_config["port"].get<int>()) + " dbname=" + database_config["dbname"].get<std::string>() + " user=" + database_config["user"].get<std::string>() + " password=" + database_config["password"].get<std::string>();
		conn = std::make_unique<pqxx::connection>(connection_string);
	}

	bool add_data(std::string title, std::string artist, std::string album, int year, std::string path) {

		if (!conn) {
			std::cerr << "Database Error: Connection object is nullptr" << std::endl;
			return false;
		}

		std::lock_guard<std::mutex> lock(mtx);
		try {
			if (conn->is_open()) {
				pqxx::work work(*conn);
				work.exec_params("INSERT INTO songs (title, artist, album, release_year, file_path) VALUES ($1, $2, $3, $4, $5)", title, artist, album, year, path);
				work.commit();
				return true;
			}
		}
		catch (const std::exception& e) {
			std::cerr << "Database Error: " << e.what() << std::endl;
		}
		return false;
	}

	crow::json::wvalue get_data() {
		crow::json::wvalue songs_list;
		songs_list = crow::json::wvalue::list();

		if (!conn || !conn->is_open()) {
			std::cerr << "Database Error: Connection object is nullptr" << std::endl;
			return songs_list;
		}

		std::lock_guard<std::mutex> lock(mtx);
		try {
				pqxx::work work(*conn);
				pqxx::result result = work.exec("SELECT id, title, artist, album, img_path, release_year, duration_song FROM songs");

				int it = 0;
				for (auto const& row : result) {
					crow::json::wvalue song;
					song["id"] = row["id"].as<std::string>();
					song["title"] = row["title"].as<std::string>();
					song["artist"] = row["artist"].as<std::string>();
					song["album"] = row["album"].is_null() ? "Unknown Album" : row["album"].as<std::string>();
					song["img_path"] = row["img_path"].is_null() ? "Unknown Image Path" : row["img_path"].as<std::string>();
					song["release_year"] = row["release_year"].as<int>();
					song["duration_song"] = row["duration_song"].is_null() ? 0.0 : row["duration_song"].as<double>();
					songs_list[it++] = std::move(song);
				}
		}
		catch (const std::exception& e) {
			std::cerr << "Error: " << e.what() << std::endl;
		}

		return songs_list;
	}

	std::string song_path(std::string id) {
		std::lock_guard<std::mutex> lock(mtx);
		try {
			if (conn && conn->is_open()) {
				pqxx::work work(*conn);
				pqxx::result result = work.exec_params("SELECT file_path FROM songs WHERE id = $1", id);

				if (!result.empty()) {
					return result[0][0].as<std::string>();
				}
			}
		}
		catch (const std::exception& e) {
			std::cerr << "Error: " << e.what() << std::endl;
		}
		return "";
	}

};