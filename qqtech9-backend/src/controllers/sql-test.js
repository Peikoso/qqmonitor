import { SQLTestService } from "../services/sql-test.js";
import { ResponseSQLTestDto } from "../dto/sql_test/response-sql-test-dto.js";
import { CreateSQLTestDto } from "../dto/sql_test/create-sql-test-dto.js";

export const SQLTestsController = {
    getAllSQLTests: async (req, res) => {
        const sqlTests = await SQLTestService.getAllSQLTests();

        const response = ResponseSQLTestDto.fromArray(sqlTests);

        return res.status(200).json(response);
    },

    createSQLTest: async (req, res) => {
        const sqlTestData = req.body;
        
        const dto = new CreateSQLTestDto(sqlTestData).validate();

        const newSQLTest = await SQLTestService.createSQLTest(dto);

        const response = new ResponseSQLTestDto(newSQLTest);

        return res.status(201).json(response);
    }
};