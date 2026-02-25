#include <taglib/fileref.h>
#include <taglib/tag.h>
#include "crow.h"
#include <fstream>
#include <filesystem>
#include <iostream>
#include "database.h"

int main() {
	std::filesystem::create_directories("storage/music");
	std::filesystem::create_directories("storage/covers");
	crow::SimpleApp app;
	Database base;

	try {

		CROW_ROUTE(app, "/main").methods("GET"_method)([]() {

			crow::json::wvalue response_body;
			response_body["autor"] = "vankos";
			response_body["stack"] = "C++, React+Vite, PostgreSQL";
			response_body["library"] = "Crow, TagLib, nlohmann_json, libpqxx";
			response_body["architecture"] = "RESTful API, Monolith";
			
			return crow::response(200, response_body);
		});

		CROW_ROUTE(app, "/upload").methods("POST"_method)([&base](const crow::request& request) {
			crow::multipart::message msg(request);

			auto it = msg.part_map.find("file");
			if (it == msg.part_map.end()) {
				return crow::response(400, "File is missing");
			}

			auto& file_part = it->second;
			std::string filename = file_part.get_header_object("Content-Disposition").params.at("filename");
			std::string path = "storage/music/" + filename;
			std::ofstream out(path, std::ios::binary);
			if (!out) {
				return crow::response(500, "Failed save file");
			}
			out << file_part.body;
			out.close();

			TagLib::FileRef file(path.c_str());
			crow::json::wvalue response_body;

			if (!file.isNull() && file.tag()) {
				auto* tag = file.tag();
				response_body["status"] = "success";
				response_body["title"] = tag->title().to8Bit(true);
				response_body["artist"] = tag->artist().to8Bit(true);
				response_body["album"] = tag->album().to8Bit(true);
				response_body["year"] = tag->year();

				bool db_save = base.add_data(tag->title().to8Bit(true), tag->artist().to8Bit(true), tag->album().to8Bit(true), tag->year(), path);

				if (db_save) {
					response_body["status"] = "success";
				}
				else {
					response_body["status"] = "failed";
					response_body["message"] = "Failed save data to Database";
				}
			}
			else {
				response_body["status"] = "failed";
				response_body["message"] = "File upload, but metadata is unreadable";
			}

			return crow::response(200, response_body);
		});

		CROW_ROUTE(app, "/songs").methods("GET"_method)([&base]() {
			auto response_body = base.get_data();
			return crow::response(200, response_body);
		});

		CROW_ROUTE(app, "/stream/<string>").methods("GET"_method)([&base](std::string id) {

			std::string file_path = base.song_path(id);
			if (file_path.empty()) {
				return crow::response(404, "Song not found");
			}

			crow::response res;
			res.set_static_file_info(file_path);
			return res;
		});

		CROW_ROUTE(app, "/storage/covers/<string>")([](std::string file) {

			crow::response res;
			std::string path = "storage/covers/" + file;
			if (std::filesystem::exists(path)) {
				res.set_static_file_info(path);
			}
			else {
				res.code = 404;
				res.body = "Image not found";
			}

			return res;

		});

	}
	catch (const std::exception& e) {
		std::cerr << "Error: " << e.what() << std::endl;
	}

	app.port(8080).multithreaded().run();

return 0;
}