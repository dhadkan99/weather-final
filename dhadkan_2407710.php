<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$servername = "sql207.infinityfree.com";
$username = "if0_35978236";
$password = "EQty3rZczhgxBd";
$database = "if0_35978236_past_weather";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if (isset($_GET['q'])) {
    $weatherName = $_GET['q'];
} else {
    $weatherName = "Hoshiarpur";
}

try {
    // Check if data for the current day already exists for the specified city
    $checkExistingData = "SELECT * FROM history WHERE city_name='$weatherName' AND DATE(currenttime) = CURDATE() LIMIT 1";
    $existingDataResult = mysqli_query($conn, $checkExistingData);

    if ($existingDataResult) {
        if (mysqli_num_rows($existingDataResult) > 0) {
            // Data exists for the current day, perform an update
            $data = json_decode(file_get_contents("https://api.openweathermap.org/data/2.5/weather?units=metric&q=" . $weatherName . "&apiKey=ee197d5374741bafce5243401fa92b5d"), true);

            if (isset($data['main']['temp'])) {
                // Data from the OpenWeatherMap API is valid
                $weather_description = $data['weather'][0]['description'];
                $temperature = $data['main']['temp'];
                $pressure = $data['main']['pressure'];
                $humidity = $data['main']['humidity'];
                $wind = $data['wind']['speed'];
                $weather_icon = $data["weather"][0]["icon"];

                $updateData = "UPDATE history SET temperature='$temperature', wind='$wind', pressure='$pressure', humidity='$humidity', weather_description='$weather_description', weather_icon='$weather_icon', currenttime=NOW() WHERE city_name='$weatherName' AND DATE(currenttime) = CURDATE()";

                if (mysqli_query($conn, $updateData)) {
                    // Perform a SELECT to get the updated data
                    $selectAllData = "SELECT * FROM history WHERE city_name='$weatherName' ORDER BY currenttime DESC";
                    $result = mysqli_query($conn, $selectAllData);

                    if ($result) {
                        $rows = [];
                        while ($row = mysqli_fetch_assoc($result)) {
                            $rows[] = $row;
                        }
                        echo json_encode($rows);
                    } else {
                        throw new Exception("Error fetching data from the database.");
                    }
                } else {
                    throw new Exception("Failed to update weather data: " . mysqli_error($conn));
                }
            } else {
                echo json_encode(array('error' => 'Invalid city name. Please enter a correct city name.'));
            }
        } else {
            // Data doesn't exist for the current day, perform an insert
            $url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=" . $weatherName . "&apiKey=ee197d5374741bafce5243401fa92b5d";
            $response = file_get_contents($url);
            $data = json_decode($response, true);

            if (isset($data['main']['temp'])) {
                // Data from the OpenWeatherMap API is valid
                $weather_description = $data['weather'][0]['description'];
                $temperature = $data['main']['temp'];
                $pressure = $data['main']['pressure'];
                $humidity = $data['main']['humidity'];
                $wind = $data['wind']['speed'];
                $city_name = $data['name'];
                $currenttime = $data['dt'];
                $weather_icon = $data["weather"][0]["icon"];

                $insertData = "INSERT INTO history (`city_name`, `temperature`, `wind`, `pressure`, `humidity`, `weather_description`, `weather_icon`, `currenttime`) VALUES ('$city_name','$temperature','$wind','$pressure','$humidity','$weather_description','$weather_icon',NOW())";

                if (mysqli_query($conn, $insertData)) {
                    // Perform a SELECT to get the inserted data
                    $selectAllData = "SELECT * FROM history WHERE city_name='$weatherName' ORDER BY currenttime DESC";
                    $result = mysqli_query($conn, $selectAllData);

                    if ($result) {
                        $rows = [];
                        while ($row = mysqli_fetch_assoc($result)) {
                            $rows[] = $row;
                        }
                        echo json_encode($rows);
                    } else {
                        throw new Exception("Error fetching data from the database.");
                    }
                } else {
                    throw new Exception("Failed to insert weather data: " . mysqli_error($conn));
                }
            } else {
                echo json_encode(array('error' => 'Invalid city name. Please enter a correct city name.'));
            }
        }
    } else {
        throw new Exception("Error checking existing data: " . mysqli_error($conn));
    }
} catch (Exception $e) {
    echo json_encode(array('error' => $e->getMessage()));
    // Add debug information to the PHP error log
    error_log("Error in PHP: " . $e->getMessage());
}

mysqli_close($conn); // Close the connection
?>
