require "httparty"

class RideApiService
  include HTTParty
  base_uri "http://fastapi:8080"

  # GET /
  def self.get_data
    response = get("/")
    if response.success?
      response.parsed_response
    else
      Rails.logger.error("FastAPI call failed: #{response.code}")
      nil
    end
  end

  # PATCH /{ride_id}
  def self.update_ride(ride_id, update_fields = {})
    response = patch("/#{ride_id}", body: update_fields.to_json, headers: { "Content-Type" => "application/json" })

    if response.success?
      response.parsed_response
    else
      Rails.logger.error("Failed to update ride #{ride_id}: #{response.code} - #{response.body}")
      nil
    end
  end
end
