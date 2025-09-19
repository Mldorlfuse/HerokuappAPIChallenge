import {expect, test} from "@playwright/test";

    const URL =  'https://apichallenges.herokuapp.com/';
    let token;

test.describe('Api challenge', ()=> {
    test.beforeAll('1. Получение токена',async ({ request }) => {
        let response = await request.post(`${URL}challenger`);
        let headers = await response.headers();
        token = headers["x-challenger"];

        expect(response.status()).toBe(201);
        expect(headers).toEqual(
            expect.objectContaining({ "x-challenger": expect.any(String) }),
        );
    });

    test('2. Получить список заданий', async({request}) => {
        let response = await request.get(`${URL}challenges`, {
            headers: {
                "x-challenger": token,
            },
        });

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
        expect(body.challenges.length).toBe(59)
    });

    test('3. Получить список дел', async({request}) => {
        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
        expect(body).toHaveProperty('todos');
    });

    test('4. Получить 404 при запросе к методу не в множественном числе', async({request}) => {
        let response = await request.get(`${URL}todo`, {
            headers: {
                'x-challenger': token
            }
        })

        expect(response.status()).toBe(404);
    });

    test('5. Получить данные конкретного todos', async({request}) => {
        let idTodo = 1;
        let response = await request.get(`${URL}todos/${idTodo}`, {
            headers: {
                'x-challenger': token
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
        expect(body).toHaveProperty('todos.[0].id', idTodo);
        expect(body).toHaveProperty('todos.[0].title', 'scan paperwork');
    });

    test('6. Получить 404 при поиске несуществующего todos', async({request}) => {
        let idTodo = 11132322;
        let response = await request.get(`${URL}todos/${idTodo}`, {
            headers: {
                'x-challenger': token
            }
        })

        expect(response.status()).toBe(404);
    });

    test('8. Получить заголовок и код ответа при запросе head к todos', async({request}) => {
        let response = await request.head(`${URL}todos`, {
            headers: {
                'x-challenger': token
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
    });

    test('9. Создать новый todo с помощью post запроса', async({request}) => {
        let testData = {
            "title": "Test test test",
            "doneStatus": true,
            "description": "Test test test"
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(201);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
        expect(body).toHaveProperty("id", expect.any(Number))
        expect(body).toHaveProperty("title", testData.title);
        expect(body).toHaveProperty("doneStatus", testData.doneStatus);
        expect(body).toHaveProperty("description", testData.description);
    });

    test('7. Получить выполненные todos', async({request}) => {
        let response = await request.get(`${URL}todos?doneStatus=true`, {
            headers: {
                'x-challenger': token
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('todos.[0].doneStatus', true)
    });

    test('10. Выполнить запрос POST для создания задачи, но не пройти проверку по полю `doneStatus`', async({request}) => {
        let testData = {
            "title": "Test test test",
            "doneStatus": 'test',
            "description": "Test test test"
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Failed Validation: doneStatus should be BOOLEAN but was STRING')
    });

    test('11. Выполняется запрос POST на создание задачи, но не проходит проверку длины поля `title`, так как заголовок превышает максимально допустимое количество символов.', async({request}) => {
        let testData = {
            "title": "file paperworkfile paperworkfile paperworkfile paperworkfile paperworkfile paperworkfile paperworkfile paperworkfile paperworkfile paperwork",
            "doneStatus": true,
            "description": ""
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50')
    });

    test('12. Выполняется запрос POST на создание задачи, но проверка длины `description` не проходит, так как количество символов в описании превышает максимально допустимое.', async({request}) => {
        let testData = {
            "title": "file paperwork",
            "doneStatus": true,
            "description": "TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest"
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200')
    });

    test('13. Выполните запрос POST, чтобы создать задачу с полями заголовка и описания максимальной длины.', async({request}) => {
        let testData = {
            "title": "hQZPNStnlIFIsUDxpXIppdCEwDRQVSmwZrOXmxjVASeZwbnKoV",
            "doneStatus": true,
            "description": "zqjrtZUxbjwDxXuSnXAtxgweCUQsXrSzlMOKfmJzpQeFsmjkEhyatNgDyTAlcdYWJtOmSnkQlzVemnjDKLOTbmHYXVtnajWfavIrLsMFqqHcDFYWzlDjYkjDSWeSOcSdBrNLMmPDkGLpRndQdKWVcOhtjCpVgteLZBITUUFRcSaNKTLSFDLxegLtlmtlohvPQVrPMVwa"
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(201);
        expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
        expect(body).toHaveProperty("id", expect.any(Number))
        expect(body).toHaveProperty("title", testData.title);
        expect(body).toHaveProperty("doneStatus", testData.doneStatus);
        expect(body).toHaveProperty("description", testData.description);
    });

    test('14. Выполняется запрос POST на создание задачи, но не проходит проверку длины полезной нагрузки в поле `description`, поскольку вся полезная нагрузка превышает максимально допустимые 5000 символов.', async({request}) => {
        let testData = {
            "title": "hQZPNStnlIFIsUDxpXIppdCEwDRQVSmwZrOXmxjVASeZwbnKoV",
            "doneStatus": true,
            "description": "HUGmwfVDxJgaOXZFDqgEDvEHGFsYeiXEKnieFEQgTSiPljSgJFtQDxElQUEdywCOrdJImbLUwKrgeXAHTjuQvfEfNYPMHFMaSqnunHpGGwfDYoEeCfpewlmLGTQiNRUhveNKNFcSbzmoOBXsvtIuwGeDfBBoLcdnRHBXbALDjaSWVjxXDqSeUfYIpfqgrSoUUpgOVPVzEXxPWhRPgAcScmkBrkJIQQWSTvJJuiVtApZQjZwIOZSYCURliCjIdmwJlrSEDIheMiqKtjxiWLRlZsSnvwpnLjXLGHLobrsEzitxjreIzQRXUoyRbSLVcKquMRmkilJBkLuzAQTNKbRJDuTGlewrueOWwIxpBUatPGsiKlJrLtOFDWnMJXAavzYPvOxlFGRBJzKuhqWWrpksinUpIohcRWXTobjuVZFGZSgoTRjufbydzQAEPGkUDSSHWyqOuIfDXsKiHUffupcWVNjwYUVRRRknZANGPavGrYHFAUAeBTDiGYPLCAOQZPdmuhEluHYEsLkNslAzxJAPvyyNyKqZlLqwQOKVXzoliMjGvgRvBixTLCpQhKIxISpjzTJTSJhCxSVADGuiWlJqSFOMwqtgfETeOSCsIEQLieicCxRilqdLLwVfXWpIikFwIohoDUIJZxCWgViuzIFkZSBwcQZDDBPGXshXhCBGokFUeZwmRIpgjXZeDUJxrOyxPestIVFdZUVgTPlXLPjIsVmywlqPPNshtYKPTmITOZQkqrNqAsffQScWeoFtiugnxJFshspWShYLBzYnHmwjiZhlQxOWPwMYASVaIbhPAjCauMrHmpGHWSzWpOJXmgSpxZaIwXUXNYBeCIXTXmWQdtYwfxNqEZetcAyfNVDkSdcuBsflpEWlVqTnFRwLlNOiPZPNUnSPiZUjNlbRiMMuusiOzBiljgacXJxtaClZMqNrxfADeINoTIVFqvisJIcNYdWUDPtDiZTBijkbQcazFcfWCVovNhKmrZCygcYYHUGmwfVDxJgaOXZFDqgEDvEHGFsYeiXEKnieFEQgTSiPljSgJFtQDxElQUEdywCOrdJImbLUwKrgeXAHTjuQvfEfNYPMHFMaSqnunHpGGwfDYoEeCfpewlmLGTQiNRUhveNKNFcSbzmoOBXsvtIuwGeDfBBoLcdnRHBXbALDjaSWVjxXDqSeUfYIpfqgrSoUUpgOVPVzEXxPWhRPgAcScmkBrkJIQQWSTvJJuiVtApZQjZwIOZSYCURliCjIdmwJlrSEDIheMiqKtjxiWLRlZsSnvwpnLjXLGHLobrsEzitxjreIzQRXUoyRbSLVcKquMRmkilJBkLuzAQTNKbRJDuTGlewrueOWwIxpBUatPGsiKlJrLtOFDWnMJXAavzYPvOxlFGRBJzKuhqWWrpksinUpIohcRWXTobjuVZFGZSgoTRjufbydzQAEPGkUDSSHWyqOuIfDXsKiHUffupcWVNjwYUVRRRknZANGPavGrYHFAUAeBTDiGYPLCAOQZPdmuhEluHYEsLkNslAzxJAPvyyNyKqZlLqwQOKVXzoliMjGvgRvBixTLCpQhKIxISpjzTJTSJhCxSVADGuiWlJqSFOMwqtgfETeOSCsIEQLieicCxRilqdLLwVfXWpIikFwIohoDUIJZxCWgViuzIFkZSBwcQZDDBPGXshXhCBGokFUeZwmRIpgjXZeDUJxrOyxPestIVFdZUVgTPlXLPjIsVmywlqPPNshtYKPTmITOZQkqrNqAsffQScWeoFtiugnxJFshspWShYLBzYnHmwjiZhlQxOWPwMYASVaIbhPAjCauMrHmpGHWSzWpOJXmgSpxZaIwXUXNYBeCIXTXmWQdtYwfxNqEZetcAyfNVDkSdcuBsflpEWlVqTnFRwLlNOiPZPNUnSPiZUjNlbRiMMuusiOzBiljgacXJxtaClZMqNrxfADeINoTIVFqvisJIcNYdWUDPtDiZTBijkbQcazFcfWCVovNhKmrZCygcYYHUGmwfVDxJgaOXZFDqgEDvEHGFsYeiXEKnieFEQgTSiPljSgJFtQDxElQUEdywCOrdJImbLUwKrgeXAHTjuQvfEfNYPMHFMaSqnunHpGGwfDYoEeCfpewlmLGTQiNRUhveNKNFcSbzmoOBXsvtIuwGeDfBBoLcdnRHBXbALDjaSWVjxXDqSeUfYIpfqgrSoUUpgOVPVzEXxPWhRPgAcScmkBrkJIQQWSTvJJuiVtApZQjZwIOZSYCURliCjIdmwJlrSEDIheMiqKtjxiWLRlZsSnvwpnLjXLGHLobrsEzitxjreIzQRXUoyRbSLVcKquMRmkilJBkLuzAQTNKbRJDuTGlewrueOWwIxpBUatPGsiKlJrLtOFDWnMJXAavzYPvOxlFGRBJzKuhqWWrpksinUpIohcRWXTobjuVZFGZSgoTRjufbydzQAEPGkUDSSHWyqOuIfDXsKiHUffupcWVNjwYUVRRRknZANGPavGrYHFAUAeBTDiGYPLCAOQZPdmuhEluHYEsLkNslAzxJAPvyyNyKqZlLqwQOKVXzoliMjGvgRvBixTLCpQhKIxISpjzTJTSJhCxSVADGuiWlJqSFOMwqtgfETeOSCsIEQLieicCxRilqdLLwVfXWpIikFwIohoDUIJZxCWgViuzIFkZSBwcQZDDBPGXshXhCBGokFUeZwmRIpgjXZeDUJxrOyxPestIVFdZUVgTPlXLPjIsVmywlqPPNshtYKPTmITOZQkqrNqAsffQScWeoFtiugnxJFshspWShYLBzYnHmwjiZhlQxOWPwMYASVaIbhPAjCauMrHmpGHWSzWpOJXmgSpxZaIwXUXNYBeCIXTXmWQdtYwfxNqEZetcAyfNVDkSdcuBsflpEWlVqTnFRwLlNOiPZPNUnSPiZUjNlbRiMMuusiOzBiljgacXJxtaClZMqNrxfADeINoTIVFqvisJIcNYdWUDPtDiZTBijkbQcazFcfWCVovNhKmrZCygcYYHUGmwfVDxJgaOXZFDqgEDvEHGFsYeiXEKnieFEQgTSiPljSgJFtQDxElQUEdywCOrdJImbLUwKrgeXAHTjuQvfEfNYPMHFMaSqnunHpGGwfDYoEeCfpewlmLGTQiNRUhveNKNFcSbzmoOBXsvtIuwGeDfBBoLcdnRHBXbALDjaSWVjxXDqSeUfYIpfqgrSoUUpgOVPVzEXxPWhRPgAcScmkBrkJIQQWSTvJJuiVtApZQjZwIOZSYCURliCjIdmwJlrSEDIheMiqKtjxiWLRlZsSnvwpnLjXLGHLobrsEzitxjreIzQRXUoyRbSLVcKquMRmkilJBkLuzAQTNKbRJDuTGlewrueOWwIxpBUatPGsiKlJrLtOFDWnMJXAavzYPvOxlFGRBJzKuhqWWrpksinUpIohcRWXTobjuVZFGZSgoTRjufbydzQAEPGkUDSSHWyqOuIfDXsKiHUffupcWVNjwYUVRRRknZANGPavGrYHFAUAeBTDiGYPLCAOQZPdmuhEluHYEsLkNslAzxJAPvyyNyKqZlLqwQOKVXzoliMjGvgRvBixTLCpQhKIxISpjzTJTSJhCxSVADGuiWlJqSFOMwqtgfETeOSCsIEQLieicCxRilqdLLwVfXWpIikFwIohoDUIJZxCWgViuzIFkZSBwcQZDDBPGXshXhCBGokFUeZwmRIpgjXZeDUJxrOyxPestIVFdZUVgTPlXLPjIsVmywlqPPNshtYKPTmITOZQkqrNqAsffQScWeoFtiugnxJFshspWShYLBzYnHmwjiZhlQxOWPwMYASVaIbhPAjCauMrHmpGHWSzWpOJXmgSpxZaIwXUXNYBeCIXTXmWQdtYwfxNqEZetcAyfNVDkSdcuBsflpEWlVqTnFRwLlNOiPZPNUnSPiZUjNlbRiMMuusiOzBiljgacXJxtaClZMqNrxfADeINoTIVFqvisJIcNYdWUDPtDiZTBijkbQcazFcfWCVovNhKmrZCygcYYHUGmwfVDxJgaOXZFDqgEDvEHGFsYeiXEKnieFEQgTSiPljSgJFtQDxElQUEdywCOrdJImbLUwKrgeXAHTjuQvfEfNYPMHFMaSqnunHpGGwfDYoEeCfpewlmLGTQiNRUhveNKNFcSbzmoOBXsvtIuwGeDfBBoLcdnRHBXbALDjaSWVjxXDqSeUfYIpfqgrSoUUpgOVPVzEXxPWhRPgAcScmkBrkJIQQWSTvJJuiVtApZQjZwIOZSYCURliCjIdmwJlrSEDIheMiqKtjxiWLRlZsSnvwpnLjXLGHLobrsEzitxjreIzQRXUoyRbSLVcKquMRmkilJBkLuzAQTNKbRJDuTGlewrueOWwIxpBUatPGsiKlJrLtOFDWnMJXAavzYPvOxlFGRBJzKuhqWWrpksinUpIohcRWXTobjuVZFGZSgoTRjufbydzQAEPGkUDSSHWyqOuIfDXsKiHUffupcWVNjwYUVRRRknZANGPavGrYHFAUAeBTDiGYPLCAOQZPdmuhEluHYEsLkNslAzxJAPvyyNyKqZlLqwQOKVXzoliMjGvgRvBixTLCpQhKIxISpjzTJTSJhCxSVADGuiWlJqSFOMwqtgfETeOSCsIEQLieicCxRilqdLLwVfXWpIikFwIohoDUIJZxCWgViuzIFkZSBwcQZDDBPGXshXhCBGokFUeZwmRIpgjXZeDUJxrOyxPestIVFdZUVgTPlXLPjIsVmywlqPPNshtYKPTmITOZQkqrNqAsffQScWeoFtiugnxJFshspWShYLBzYnHmwjiZhlQxOWPwMYASVaIbhPAjCauMrHmpGHWSzWpOJXmgSpxZaIwXUXNYBeCIXTXmWQdtYwfxNqEZetcAyfNVDkSdcuBsflpEWlVqTnFRwLlNOiPZPNUnSPiZUjNlbRiMMuusiOzBiljgacXJxtaClZMqNrxfADeINoTIVFqvisJIcNYdWUDPtDiZTBijkbQcazFcfWCVovNhKmrZCygcYY"
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(413);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Error: Request body too large, max allowed is 5000 bytes')
    });

    test('15. Выполняется запрос POST на создание задачи, но проверка не проходит, поскольку полезная нагрузка содержит нераспознанное поле.', async({request}) => {
        let testData = {
            "title": "a title",
            "priority": "extra",
            "description": ""
        }

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Could not find field: priority')
    });

    test('16. Выполните запрос PUT, чтобы безуспешно создать задачу', async({request}) => {
        let testData = {
            "title": "a title",
            "doneStatus": true,
            "description": ""
        }
        let testId = 123132

        let response = await request.put(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("errorMessages.[0]", 'Cannot create todo with PUT due to Auto fields id')
    });

    test('17. Выполните запрос POST для успешного обновления задачи', async({request}) => {
        let testData = {
            "title": "a title",
            "doneStatus": true,
            "description": ""
        }
        let testId = 1

        let response = await request.post(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("id", testId)
        expect(body).toHaveProperty("title", testData.title)
        expect(body).toHaveProperty("doneStatus", testData.doneStatus)
        expect(body).toHaveProperty("description", testData.description)
    });

    test('18. Отправьте POST-запрос на несуществующую задачу. Ожидайте получить ответ 404.', async({request}) => {
        let testData = {
            "title": "a title",
            "doneStatus": true,
            "description": ""
        }
        let testId = 1121

        let response = await request.post(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(404);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('errorMessages.[0]', `No such todo entity instance with id == ${testId} found`)
    });

    test('19. Выполните запрос PUT, чтобы обновить существующую задачу, указав полную полезную нагрузку, т. е. заголовок, описание и статус выполнения.', async({request}) => {
        let testData = {
            "title": "a new title",
            "doneStatus": true,
            "description": ""
        }
        let testId = 1

        let response = await request.put(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("id", testId)
        expect(body).toHaveProperty("title", testData.title)
        expect(body).toHaveProperty("doneStatus", testData.doneStatus)
        expect(body).toHaveProperty("description", testData.description)
    });

    test('20. Выполните запрос PUT, чтобы обновить существующую задачу, оставив в полезной нагрузке только обязательные элементы, например заголовок.', async({request}) => {
        let testData = {
            "title": "a new title"
        }
        let testId = 1

        let response = await request.put(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("id", testId)
        expect(body).toHaveProperty("title", testData.title)
        expect(body).toHaveProperty("doneStatus", false)
        expect(body).toHaveProperty("description", "")
    });

    test('21. Выполните запрос PUT, чтобы отменить обновление существующей задачи, поскольку в полезной нагрузке отсутствует ее заголовок.', async({request}) => {
        let testData = {
            "doneStatus": true,
            "description": ""
        }
        let testId = 1

        let response = await request.put(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('errorMessages.[0]', `title : field is mandatory`)
    });

    test('22. Выполните запрос PUT, чтобы отменить обновление существующей задачи, поскольку в полезной нагрузке отсутствует ее заголовок.', async({request}) => {
        let testData = {
            "id": 123,
            "title": "a new title",
            "doneStatus": true,
            "description": ""
        }
        let testId = 1

        let response = await request.put(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(400);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('errorMessages.[0]', `Can not amend id from ${testId} to ${testData.id}`)
    });

    test('23. Выполните запрос DELETE, чтобы успешно удалить задачу.', async({request}) => {
        let testId = 1

        let response = await request.delete(`${URL}todos/${testId}`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
    });

    test('25. Выполните запрос GET к конечной точке `/todos` с заголовком `Accept` `application/xml`, чтобы получить результаты в формате XML.', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                'Accept': 'application/xml'
            }
        })

        let body = await response.text();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(headers).toEqual(expect.objectContaining({"content-type": 'application/xml' }));
    });

    test('26. Выполните запрос GET к конечной точке `/todos` с заголовком `Accept` `application/json`, чтобы получить результаты в формате JSON.', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(headers).toEqual(expect.objectContaining({"content-type": 'application/json' }));
    });

    test('27. Выполните запрос GET к конечной точке `/todos` с заголовком `Accept` `*/*`, чтобы получить результаты в формате JSON по умолчанию.', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(headers).toEqual(expect.objectContaining({"content-type": 'application/json' }));
    });

    test('28. Выполните запрос GET к конечной точке `/todos` с заголовком `Accept` `application/xml, application/json`, чтобы получить результаты в предпочтительном формате XML.', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                'Accept': 'application/xml, application/json'
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(headers).toEqual(expect.objectContaining({"content-type": 'application/xml' }));
    });

    test('29. Выполните запрос GET к конечной точке `/todos` без заголовка `Accept` в сообщении, чтобы получить результаты в формате JSON по умолчанию.', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json'
            }
        })

        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(headers).toEqual(expect.objectContaining({"content-type": 'application/json' }));
    });

    test('30. Выполните запрос GET на конечную точку `/todos` с заголовком `Accept` `application/gzip`, чтобы получить код состояния 406 «НЕ ПРИЕМЛЕМО».', async({request}) => {
        let testId = 1

        let response = await request.get(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
                'Accept': 'application/gzip'
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(406);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('errorMessages.[0]', 'Unrecognised Accept Type');
    });

    test('31. Выполните запрос POST к конечной точке `/todos`, чтобы создать задачу, используя Content-Type `application/xml` и принимая только XML, т.е. принимая заголовок `application/xml`', async({request}) => {
        let testData = '<todo> <doneStatus>false</doneStatus> <description/> <title>file paperwork</title> </todo>'

        let testId = 1

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/xml',
            },
            data: testData
        })

        let body = await response.text();
        let headers = await response.headers();

        expect(response.status()).toBe(201);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
    });

    test('32. Выполните запрос POST к конечной точке `/todos`, чтобы создать задачу, используя Content-Type `application/json` и принимая только JSON, т.е. принимая заголовок `application/json`', async({request}) => {
        let testData = {
            "title": "a title",
            "doneStatus": true,
            "description": ""
        }

        let testId = 1

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': 'application/json',
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(201);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty("title", testData.title)
        expect(body).toHaveProperty("doneStatus", testData.doneStatus)
        expect(body).toHaveProperty("description", testData.description)
    });

    test('33. Выполните запрос POST к конечной точке `/todos` с неподдерживаемым типом контента, чтобы сгенерировать код статуса 415.', async({request}) => {
        let testData = {
            "title": "a title",
            "doneStatus": true,
            "description": ""
        }

        let testContentType = 'bob';

        let response = await request.post(`${URL}todos`, {
            headers: {
                'x-challenger': token,
                'Content-Type': testContentType,
            },
            data: testData
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(415);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('errorMessages.[0]', `Unsupported Content Type - ${testContentType}`)
    });

    test('34. Отправьте GET-запрос к конечной точке `/challenger/{guid}`, указав GUID существующего претендента. Это вернет данные о прогрессе, которые можно будет использовать для последующего восстановления вашего прогресса до этого статуса.', async({request}) => {
        let response = await request.get(`${URL}challenger/${token}`, {
            headers: {
                'x-challenger': token
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('xChallenger', token)
    });

    test('35. Отправьте запрос PUT на конечную точку `/challenger/{guid}`, указав существующий GUID претендента, чтобы восстановить прогресс этого претендента в памяти', async({request}) => {
        let response = await request.get(`${URL}challenger/${token}`, {
            headers: {
                'x-challenger': token
            }
        })

        let body = await response.json();
        let headers = await response.headers();

        expect(response.status()).toBe(200);
        expect(headers).toEqual(expect.objectContaining({"x-challenger": token }));
        expect(body).toHaveProperty('xChallenger', token)
    });
})