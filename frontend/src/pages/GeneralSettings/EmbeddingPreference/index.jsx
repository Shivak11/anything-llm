import React, { useEffect, useState } from "react";
import Sidebar, {
  SidebarMobileHeader,
} from "../../../components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import System from "../../../models/system";
import showToast from "../../../utils/toast";
import OpenAiLogo from "../../../media/llmprovider/openai.png";
import AzureOpenAiLogo from "../../../media/llmprovider/azure.png";
import PreLoader from "../../../components/Preloader";
import LLMProviderOption from "../../../components/LLMSelection/LLMProviderOption";

export default function GeneralEmbeddingPreference() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [embeddingChoice, setEmbeddingChoice] = useState("openai");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {};
    const form = new FormData(e.target);
    for (var [key, value] of form.entries()) data[key] = value;
    const { error } = await System.updateSystem(data);
    if (error) {
      showToast(`Failed to save embedding preferences: ${error}`, "error");
    } else {
      showToast("Embedding preferences saved successfully.", "success");
    }
    setSaving(false);
    setHasChanges(!!error);
  };

  const updateChoice = (selection) => {
    setEmbeddingChoice(selection);
    setHasChanges(true);
  };

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      setSettings(_settings);
      setEmbeddingChoice(_settings?.EmbeddingEngine || "openai");
      setLoading(false);
    }
    fetchKeys();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-sidebar flex">
      {!isMobile && <Sidebar />}
      {loading ? (
        <div
          style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
          className="transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] bg-main-gradient md:min-w-[82%] p-[18px] h-full overflow-y-scroll animate-pulse"
        >
          <div className="w-full h-full flex justify-center items-center">
            <PreLoader />
          </div>
        </div>
      ) : (
        <div
          style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
          className="transition-all duration-500 relative md:ml-[2px] md:mr-[8px] md:my-[16px] md:rounded-[26px] bg-main-gradient md:min-w-[82%] p-[18px] h-full overflow-y-scroll"
        >
          {isMobile && <SidebarMobileHeader />}
          <form
            onSubmit={handleSubmit}
            onChange={() => setHasChanges(true)}
            className="flex w-full"
          >
            <div className="flex flex-col w-full px-1 md:px-20 md:py-12 py-16">
              <div className="w-full flex flex-col gap-y-1 pb-6 border-white border-b-2 border-opacity-10">
                <div className="items-center flex gap-x-4">
                  <p className="text-2xl font-semibold text-white">
                    Embedding Preference
                  </p>
                  {hasChanges && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="border border-slate-200 px-4 py-1 rounded-lg text-slate-200 text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  )}
                </div>
                <p className="text-sm font-base text-white text-opacity-60">
                  When using an LLM that does not natively support an embedding
                  engine - you may need to additionally specify credentials to
                  for embedding text.
                  <br />
                  Embedding is the process of turning text into vectors. These
                  credentials are required to turn your files and prompts into a
                  format which AnythingLLM can use to process.
                </p>
              </div>

              {["openai", "azure"].includes(settings.LLMProvider) ? (
                <div className="w-full h-20 items-center justify-center flex">
                  <p className="text-gray-800 dark:text-slate-400 text-center">
                    Your current LLM preference does not require you to set up
                    this part of AnythingLLM.
                    <br />
                    Embedding is being automatically managed by AnythingLLM.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-white text-sm font-medium py-4">
                    Embedding Providers
                  </div>
                  <div className="w-full flex md:flex-wrap overflow-x-scroll gap-4 max-w-[900px]">
                    <input
                      hidden={true}
                      name="EmbeddingEngine"
                      value={embeddingChoice}
                    />
                    <LLMProviderOption
                      name="OpenAI"
                      value="openai"
                      link="openai.com"
                      description="Use OpenAI's text-embedding-ada-002 embedding model."
                      checked={embeddingChoice === "openai"}
                      image={OpenAiLogo}
                      onClick={updateChoice}
                    />
                    <LLMProviderOption
                      name="Azure OpenAI"
                      value="azure"
                      link="azure.microsoft.com"
                      description="The enterprise option of OpenAI hosted on Azure services."
                      checked={embeddingChoice === "azure"}
                      image={AzureOpenAiLogo}
                      onClick={updateChoice}
                    />
                  </div>
                  <div className="mt-10 flex flex-wrap gap-4 max-w-[800px]">
                    {embeddingChoice === "openai" && (
                      <>
                        <div className="flex flex-col w-60">
                          <label className="text-white text-sm font-semibold block mb-4">
                            API Key
                          </label>
                          <input
                            type="text"
                            name="OpenAiKey"
                            className="bg-zinc-900 text-white placeholder-white placeholder-opacity-60 text-sm rounded-lg focus:border-white block w-full p-2.5"
                            placeholder="OpenAI API Key"
                            defaultValue={
                              settings?.OpenAiKey ? "*".repeat(20) : ""
                            }
                            required={true}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                      </>
                    )}

                    {embeddingChoice === "azure" && (
                      <>
                        <div className="flex flex-col w-60">
                          <label className="text-white text-sm font-semibold block mb-4">
                            Azure Service Endpoint
                          </label>
                          <input
                            type="url"
                            name="AzureOpenAiEndpoint"
                            className="bg-zinc-900 text-white placeholder-white placeholder-opacity-60 text-sm rounded-lg focus:border-white block w-full p-2.5"
                            placeholder="https://my-azure.openai.azure.com"
                            defaultValue={settings?.AzureOpenAiEndpoint}
                            required={true}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>

                        <div className="flex flex-col w-60">
                          <label className="text-white text-sm font-semibold block mb-4">
                            API Key
                          </label>
                          <input
                            type="password"
                            name="AzureOpenAiKey"
                            className="bg-zinc-900 text-white placeholder-white placeholder-opacity-60 text-sm rounded-lg focus:border-white block w-full p-2.5"
                            placeholder="Azure OpenAI API Key"
                            defaultValue={
                              settings?.AzureOpenAiKey ? "*".repeat(20) : ""
                            }
                            required={true}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>

                        <div className="flex flex-col w-60">
                          <label className="text-white text-sm font-semibold block mb-4">
                            Embedding Deployment Name
                          </label>
                          <input
                            type="text"
                            name="AzureOpenAiEmbeddingModelPref"
                            className="bg-zinc-900 text-white placeholder-white placeholder-opacity-60 text-sm rounded-lg focus:border-white block w-full p-2.5"
                            placeholder="Azure OpenAI embedding model deployment name"
                            defaultValue={
                              settings?.AzureOpenAiEmbeddingModelPref
                            }
                            required={true}
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
