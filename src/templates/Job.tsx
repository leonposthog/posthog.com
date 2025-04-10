import Layout from 'components/Layout'
import PostLayout from 'components/PostLayout'
import { SEO } from 'components/seo'
import { graphql } from 'gatsby'
import React from 'react'
import Link from 'components/Link'
import { CompensationCalculator } from 'components/CompensationCalculator'
import InterviewProcess from 'components/Job/InterviewProcess'
import Apply from 'components/Job/Apply'
import Sidebar from 'components/Job/Sidebar'
import { sfBenchmark } from 'components/CompensationCalculator/compensation_data/sf_benchmark'
import { benefits } from 'components/Careers/Benefits'
import { Department, Location, Timezone } from 'components/NotProductIcons'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { companyMenu } from '../navs'
import groupBy from 'lodash.groupby'

const Detail = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => {
    return (
        <li className="flex space-x-2">
            <span className="w-6 h-6 text-black dark:text-white flex-shrink-0">{icon}</span>
            <span className="grid">
                <h4 className="text-sm m-0 font-normal leading-none pt-1">
                    <span>{title}</span>
                </h4>
                <p className="text-[15px] m-0 mt-1">
                    <strong className="text-black dark:text-white">{value}</strong>
                </p>
            </span>
        </li>
    )
}

const Accordion = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => {
    return (
        <details open>
            <summary>
                <h2 id={id}>{title}</h2>
            </summary>
            {children}
        </details>
    )
}

export default function Job({
    data: {
        teams,
        objectives,
        mission,
        allJobPostings,
        ashbyJobPosting: {
            departmentName,
            info,
            id,
            parent,
            fields: { tableOfContents, html, title, slug, locations },
        },
    },
    pageContext: { gitHubIssues },
}) {
    const timezone = parent?.customFields?.find(({ title }) => title === 'Timezone(s)')?.value
    const salaryRole = parent?.customFields?.find(({ title }) => title === 'Salary')?.value || title
    const missionAndObjectives = parent?.customFields?.find(({ title }) => title === 'Mission & objectives')?.value
    const showObjectives = missionAndObjectives !== 'false'
    const availableTeams = groupBy(allJobPostings.nodes, ({ parent, departmentName }) => {
        const teams = JSON.parse(parent?.customFields?.find(({ title }) => title === 'Teams')?.value || '[]')
        const speculative = departmentName?.toLowerCase() === 'speculative'
        return speculative ? 'Speculative' : teams.length > 1 ? 'Multiple teams' : `Team ${teams[0]}`
    })
    const multipleTeams = teams?.nodes?.length > 1
    const teamName = multipleTeams ? 'Multiple teams' : teams?.nodes?.[0]?.name ? `Team ${teams?.nodes?.[0]?.name}` : ''

    const openRolesMenu = []
    Object.keys(availableTeams)
        .sort()
        .forEach((team) => {
            openRolesMenu.push({ name: team })
            availableTeams[team]?.forEach(({ fields: { title, slug } }) => {
                openRolesMenu.push({
                    name: title.split(' - ')[0],
                    url: slug,
                })
            })
        })
    const menu = [
        {
            name: 'Work at PostHog',
        },
        {
            name: 'Careers home',
            url: '/careers',
        },
        {
            name: 'About us',
            url: '/about',
        },
        {
            name: 'Our story',
            url: '/handbook/company/story',
        },
        {
            name: 'Open roles',
            url: '',
            children: openRolesMenu,
        },
    ]

    const [jobTitle] = title.split(' - ')

    return (
        <Layout
            parent={companyMenu}
            activeInternalMenu={companyMenu.children.find(({ name }) => name.toLowerCase() === 'careers')}
        >
            <SEO
                title={`${title} - PostHog`}
                image={`${process.env.GATSBY_CLOUDFRONT_OG_URL}/${slug.replace(/\//g, '')}.jpeg`}
                imageType="absolute"
            />
            <div className="">
                <PostLayout
                    tableOfContents={[
                        ...tableOfContents,
                        { ...(sfBenchmark[salaryRole] ? { value: 'Salary', url: 'salary', depth: 0 } : {}) },
                        { value: 'Benefits', url: 'benefits', depth: 0 },
                        {
                            ...(gitHubIssues.length > 0
                                ? { value: 'Typical tasks', url: 'typical-tasks', depth: 0 }
                                : {}),
                        },
                        {
                            ...(!multipleTeams && showObjectives && objectives
                                ? { value: "Your team's mission and objectives", url: 'mission-objectives', depth: 0 }
                                : {}),
                        },
                        { value: 'Interview process', url: 'interview-process', depth: 0 },
                        { value: 'Apply', url: 'apply', depth: 0 },
                    ]}
                    hideSearch
                    hideSurvey
                    sidebar={<Sidebar teams={teams?.nodes} />}
                    title="Careers"
                    menu={menu}
                >
                    <div className="relative">
                        <div>
                            {teamName && <p className="m-0 opacity-60 pb-2">{teamName}</p>}
                            <h1 className="m-0 text-5xl">{jobTitle}</h1>
                            <ul className="list-none m-0 p-0 md:items-center text-black/50 dark:text-white/50 mt-6 flex md:flex-row flex-col md:space-x-12 md:space-y-0 space-y-6">
                                {departmentName?.toLowerCase() !== 'speculative' && (
                                    <Detail title="Department" value={departmentName} icon={<Department />} />
                                )}
                                <Detail
                                    title="Location"
                                    value={`Remote${locations?.length > 0 ? ` (${locations.join(', ')})` : ''}`}
                                    icon={<Location />}
                                />
                                {timezone && <Detail title="Timezone(s)" value={timezone} icon={<Timezone />} />}
                            </ul>
                            <div className="job-content mt-12 w-full flex-shrink-0 transition-all">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: html,
                                    }}
                                />
                                {sfBenchmark[salaryRole] && (
                                    <Accordion title="Salary" id="salary">
                                        <p>
                                            We have a set system for compensation as part of being transparent. Salary
                                            varies based on location and level of experience.
                                        </p>
                                        <p>
                                            <Link to="/handbook/people/compensation">
                                                Learn more about compensation
                                            </Link>
                                        </p>
                                        <div className="mb-6">
                                            <CompensationCalculator hideRole initialJob={salaryRole} />
                                        </div>
                                    </Accordion>
                                )}
                                <Accordion title="Benefits" id="benefits">
                                    <ul className="list-none m-0 p-0 pb-4 grid md:grid-cols-2 grid-cols-1 gap-6">
                                        {benefits.map(({ title, image }) => {
                                            return (
                                                <li
                                                    key={title}
                                                    className="flex space-x-3 items-center font-medium leading-tight text-[15px]"
                                                >
                                                    <img className="max-w-[30px]" alt={title} src={image} />
                                                    <span>{title}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    <p>
                                        Get more details about all our benefits on the{' '}
                                        <Link to="/careers#benefits">Careers page</Link>.
                                    </p>
                                </Accordion>
                                {gitHubIssues.length > 0 && (
                                    <Accordion title="Typical tasks" id="typical-tasks">
                                        <div className="mb-2">
                                            <p>Here are some open GitHub issues you could help solve:</p>
                                            <ul className="list-none !m-0 p-0 grid gap-y-4">
                                                {gitHubIssues.map(({ url, number, title, labels }) => {
                                                    return (
                                                        <li key={title} className="flex flex-col ">
                                                            <div className="flex space-x-2">
                                                                <Link to={url} className="block w-[60px] md:w-auto">
                                                                    <span className="font-semibold text-sm text-black/50 hover:text-black/75 dark:text-white/50 dark:hover:text-white/75 font-code">
                                                                        #{number}
                                                                    </span>
                                                                </Link>
                                                                <Link to={url}>{title}</Link>
                                                            </div>
                                                            {labels && labels.length > 0 && (
                                                                <ul className="list-none !ml-[calc(60px+.25rem)] md:!ml-14 !mt-0 !mb-0 p-0 flex items-center space-x-1">
                                                                    {labels.map(({ name, url }, index) => {
                                                                        return (
                                                                            <li key={name + index}>
                                                                                <Link
                                                                                    className="transition-all text-sm rounded-sm py-1 px-[5px] bg-blue/10 hover:bg-blue/20 text-blue hover:text-blue dark:bg-white/10 dark:hover:bg-white/30 dark:text-white/75 dark:hover:text-white/100"
                                                                                    to={url}
                                                                                >
                                                                                    {name}
                                                                                </Link>
                                                                            </li>
                                                                        )
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </Accordion>
                                )}
                                {!multipleTeams && showObjectives && objectives && (
                                    <Accordion title="Your team's mission and objectives" id="mission-objectives">
                                        <div className="mb-6">
                                            {mission?.body && (
                                                <MDXProvider components={{ HideFromJobPosting: () => null }}>
                                                    <MDXRenderer>{mission.body}</MDXRenderer>
                                                </MDXProvider>
                                            )}
                                            <MDXProvider components={{ HideFromJobPosting: () => null }}>
                                                <MDXRenderer>{objectives.body}</MDXRenderer>
                                            </MDXProvider>
                                        </div>
                                    </Accordion>
                                )}
                                <Accordion title="Interview process" id="interview-process">
                                    <div className="mb-6">
                                        <p>
                                            We do 2-3 short interviews, then pay you to do some real-life (or close to
                                            real-life) work.
                                        </p>
                                        <InterviewProcess role={title} inApplicationProcess />
                                    </div>
                                </Accordion>
                                <Accordion title="Apply" id="apply">
                                    <div className="mb-6">
                                        <Apply id={id} info={info} />
                                    </div>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </PostLayout>
            </div>
        </Layout>
    )
}

export const query = graphql`
    query JobQuery($id: String!, $objectives: String!, $mission: String!, $teams: [String]) {
        ashbyJobPosting(id: { eq: $id }) {
            id
            departmentName
            fields {
                tableOfContents {
                    value
                    url
                    depth
                }
                html
                title
                slug
                locations
            }
            parent {
                ... on AshbyJob {
                    customFields {
                        value
                        title
                    }
                }
            }
            info {
                descriptionHtml
                applicationFormDefinition {
                    sections {
                        fields {
                            isRequired
                            descriptionPlain
                            field {
                                type
                                title
                                isNullable
                                path
                                selectableValues {
                                    label
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
        allJobPostings: allAshbyJobPosting {
            nodes {
                departmentName
                fields {
                    title
                    slug
                }
                parent {
                    ... on AshbyJob {
                        customFields {
                            value
                            title
                        }
                    }
                }
            }
        }
        objectives: mdx(fields: { slug: { eq: $objectives } }) {
            body
        }
        mission: mdx(fields: { slug: { eq: $mission } }) {
            body
        }
        teams: allSqueakTeam(filter: { name: { in: $teams } }) {
            nodes {
                id
                name
                leadProfiles {
                    data {
                        id
                    }
                }
                profiles {
                    data {
                        id
                        attributes {
                            country
                            firstName
                            lastName
                            pineappleOnPizza
                            leadTeams {
                                data {
                                    attributes {
                                        name
                                    }
                                }
                            }
                            avatar {
                                data {
                                    attributes {
                                        url
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`
