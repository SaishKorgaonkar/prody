import os
import subprocess
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit(1)
CLIENT = genai.Client(api_key=API_KEY)

def run_command(command: str) -> str:
    print(f"\n[Tool Execution] {command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error executing command: {e.stderr}"

def inspect_application(directory: str) -> str:
    """Scans the application files to determine the tech stack.

    Args:
        directory: The directory path of the application.
    """
    return run_command(f"ls -la {directory}")

def generate_architecture_image(prompt: str) -> str:
    """Generates a visual architecture diagram based on the prompt and saves it.
    
    Args:
        prompt: A detailed description of the cloud architecture to visualize.
    """
    print(f"\n[Architect Tool] Generating image using 'gemini-nano-banana-2'...")
    try:
        result = CLIENT.models.generate_images(
            model='gemini-nano-banana-2',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/jpeg"
            )
        )
        if result.generated_images:
            image = result.generated_images[0]
            with open("architecture.jpg", "wb") as f:
                f.write(image.image.image_bytes)
            return "Successfully generated and saved architecture diagram to architecture.jpg"
        return "Failed to generate image (no images returned)."
    except Exception as e:
        return f"Error generating image: {str(e)}. (Note: If this is a custom model, ensure it is properly configured for image generation)."

def create_gcp_project(project_id: str, billing_account_id: str) -> str:
    """Creates a GCP project and links it to a billing account."""
    out1 = run_command(f"gcloud projects create {project_id}")
    out2 = run_command(f"gcloud beta billing projects link {project_id} --billing-account {billing_account_id}")
    return f"{out1}\n{out2}"

def enable_apis(project_id: str, services: list[str]) -> str:
    """Enables required GCP APIs for a project."""
    services_str = " ".join(services)
    return run_command(f"gcloud services enable {services_str} --project {project_id}")

def deploy_infrastructure(project_id: str, gcloud_commands: list[str]) -> str:
    """Executes the deployment commands for the application.
    
    Args:
        project_id: The GCP project ID.
        gcloud_commands: A list of gcloud commands to execute.
    """
    output = ""
    for cmd in gcloud_commands:
        if "--project" not in cmd and project_id:
            cmd = f"{cmd} --project {project_id}"
        output += run_command(cmd) + "\n"
    return output

def main():
    architect_instructions = (
        "You are a Cloud Architect specialized strictly in designing cloud architectures. "
        "Your job is to:\n"
        "1. Ask the user for their application directory.\n"
        "2. Inspect the application using the 'inspect_application' tool.\n"
        "3. Design an appropriate GCP architecture and explain it to the user.\n"
        "4. ALWAYS generate a visual architecture diagram by calling the 'generate_architecture_image' tool with a highly descriptive prompt.\n"
        "5. Conclude your interaction by asking the user to review the architecture. Tell them to say 'APPROVE' if they are ready to deploy."
    )
    
    devops_instructions = (
        "You are a Senior DevOps Agent strictly specialized in executing GCP deployments via gcloud. "
        "You receive an approved architecture from the Cloud Architect. "
        "Your job is to:\n"
        "1. Create the GCP project using the 'create_gcp_project' tool. (Default billing account: 019B50-4CED52-737F15)\n"
        "2. Enable necessary APIs using 'enable_apis'.\n"
        "3. Deploy the application using 'deploy_infrastructure'.\n"
        "Inform the user of your progress and confirm when deployment is fully complete."
    )
    
    architect_config = types.GenerateContentConfig(
        system_instruction=architect_instructions,
        tools=[inspect_application, generate_architecture_image],
        temperature=0.3,
    )
    
    devops_config = types.GenerateContentConfig(
        system_instruction=devops_instructions,
        tools=[create_gcp_project, enable_apis, deploy_infrastructure],
        temperature=0.1,
    )
    
    print("=========================================")
    print(" Multi-Agent GCP Deployment System ")
    print("=========================================")
    print("[1] Cloud Architect Agent (Planning Phase)")
    print("[2] Senior DevOps Agent (Execution Phase)")
    print("=========================================\n")
    
    architect_chat = CLIENT.chats.create(model="gemini-2.5-pro", config=architect_config)
    
    print("--- Phase 1: Cloud Architect ---")
    architect_history = []
    approved = False
    
    try:
        response = architect_chat.send_message("Hello! Please start by asking for the application directory.")
        print(f"Architect: {response.text}")
        architect_history.append(f"Architect: {response.text}")
    except Exception as e:
        print(f"Error starting Architect session: {e}")
        return
    
    while not approved:
        try:
            user_input = input("User: ")
            if user_input.lower() in ["exit", "quit"]:
                return
                
            architect_history.append(f"User: {user_input}")
            
            if "approve" in user_input.lower():
                approved = True
                print("\n[Orchestrator] Architecture approved! Handing off to Senior DevOps Agent...\n")
                break
                
            response = architect_chat.send_message(user_input)
            print(f"Architect: {response.text}")
            architect_history.append(f"Architect: {response.text}")
            
        except KeyboardInterrupt:
            return
        except Exception as e:
            print(f"Error communicating with Architect: {e}")
            
    print("--- Phase 2: Senior DevOps ---")
    devops_chat = CLIENT.chats.create(model="gemini-2.5-pro", config=devops_config)
    
    context = "\n".join(architect_history)
    handoff_prompt = (
        "Here is the context of the conversation between the user and the Cloud Architect. "
        "The user has approved the architecture. Please review the plan, identify what needs to be deployed, "
        "and begin provisioning the resources using your tools.\n\n"
        f"--- CONVERSATION HISTORY ---\n{context}"
    )
    
    try:
        print("[Orchestrator] Sending context to DevOps Agent (this may take a moment)...\n")
        response = devops_chat.send_message(handoff_prompt)
        print(f"DevOps: {response.text}")
        
        while True:
            user_input = input("User (DevOps Phase): ")
            if user_input.lower() in ["exit", "quit"]:
                break
            response = devops_chat.send_message(user_input)
            print(f"DevOps: {response.text}")
            
    except KeyboardInterrupt:
        return
    except Exception as e:
        print(f"Error communicating with DevOps: {e}")

if __name__ == "__main__":
    main()
